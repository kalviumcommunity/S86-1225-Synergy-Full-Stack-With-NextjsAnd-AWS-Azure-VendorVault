/**
 * AWS Secrets Manager Integration
 * Securely retrieve environment variables and API secrets from AWS
 */

import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";

// Initialize AWS Secrets Manager client
const client = new SecretsManagerClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: process.env.AWS_ACCESS_KEY_ID
    ? {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
      }
    : undefined, // Use IAM role if no credentials provided
});

export interface SecretsManagerConfig {
  secretId: string;
  region?: string;
}

/**
 * Retrieve a secret from AWS Secrets Manager
 * @param secretId - The name or ARN of the secret
 * @returns Parsed secret value as object
 */
export async function getSecret(
  secretId: string
): Promise<Record<string, string>> {
  try {
    const command = new GetSecretValueCommand({
      SecretId: secretId,
    });

    const response = await client.send(command);

    if (response.SecretString) {
      return JSON.parse(response.SecretString);
    }

    throw new Error("Secret value is empty or binary format not supported");
  } catch (error) {
    console.error("Error retrieving secret from AWS Secrets Manager:", error);
    throw error;
  }
}

/**
 * Get all application secrets from AWS Secrets Manager
 * Uses SECRET_ARN or SECRET_NAME from environment
 */
export async function getAppSecrets(): Promise<Record<string, string>> {
  const secretId = process.env.SECRET_ARN || process.env.SECRET_NAME;

  if (!secretId) {
    throw new Error(
      "SECRET_ARN or SECRET_NAME environment variable must be set"
    );
  }

  return await getSecret(secretId);
}

/**
 * Get a specific secret value by key
 * @param key - The key of the secret to retrieve
 */
export async function getSecretValue(key: string): Promise<string | undefined> {
  const secrets = await getAppSecrets();
  return secrets[key];
}

/**
 * Check if AWS Secrets Manager is configured
 */
export function isSecretsManagerConfigured(): boolean {
  return !!(
    process.env.AWS_REGION &&
    (process.env.SECRET_ARN || process.env.SECRET_NAME)
  );
}

/**
 * Load secrets into environment variables at runtime
 * Useful for Next.js API routes or server-side rendering
 */
export async function loadSecretsToEnv(): Promise<void> {
  if (!isSecretsManagerConfigured()) {
    console.warn("AWS Secrets Manager not configured, skipping secret loading");
    return;
  }

  try {
    const secrets = await getAppSecrets();

    // Inject secrets into process.env
    Object.entries(secrets).forEach(([key, value]) => {
      if (!process.env[key]) {
        process.env[key] = value;
      }
    });

    console.log(
      `✅ Loaded ${Object.keys(secrets).length} secrets from AWS Secrets Manager`
    );
  } catch (error) {
    console.error("Failed to load secrets from AWS Secrets Manager:", error);
    throw error;
  }
}

/**
 * Validate required secrets are present
 * @param requiredKeys - Array of required secret keys
 */
export async function validateSecrets(
  requiredKeys: string[]
): Promise<boolean> {
  try {
    const secrets = await getAppSecrets();
    const missingKeys = requiredKeys.filter((key) => !secrets[key]);

    if (missingKeys.length > 0) {
      console.error("Missing required secrets:", missingKeys);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error validating secrets:", error);
    return false;
  }
}
