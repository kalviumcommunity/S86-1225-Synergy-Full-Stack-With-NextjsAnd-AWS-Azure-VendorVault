/**
 * Azure Key Vault Integration
 * Securely retrieve environment variables and API secrets from Azure
 */

import { SecretClient } from "@azure/keyvault-secrets";
import { DefaultAzureCredential } from "@azure/identity";

let client: SecretClient | null = null;

/**
 * Initialize Azure Key Vault client
 */
function getClient(): SecretClient {
  if (client) {
    return client;
  }

  const vaultName =
    process.env.KEYVAULT_NAME || process.env.AZURE_KEYVAULT_NAME;

  if (!vaultName) {
    throw new Error(
      "KEYVAULT_NAME or AZURE_KEYVAULT_NAME environment variable must be set"
    );
  }

  const vaultUrl = `https://${vaultName}.vault.azure.net`;

  // Use DefaultAzureCredential which supports multiple authentication methods:
  // - Environment variables (AZURE_CLIENT_ID, AZURE_CLIENT_SECRET, AZURE_TENANT_ID)
  // - Managed Identity (when running in Azure)
  // - Azure CLI credentials (for local development)
  const credential = new DefaultAzureCredential();

  client = new SecretClient(vaultUrl, credential);
  return client;
}

/**
 * Get a single secret from Azure Key Vault
 * @param secretName - Name of the secret
 * @returns Secret value
 */
export async function getSecret(secretName: string): Promise<string> {
  try {
    const client = getClient();
    const secret = await client.getSecret(secretName);

    if (!secret.value) {
      throw new Error(`Secret ${secretName} has no value`);
    }

    return secret.value;
  } catch (error) {
    console.error(
      `Error retrieving secret ${secretName} from Azure Key Vault:`,
      error
    );
    throw error;
  }
}

/**
 * Get multiple secrets from Azure Key Vault
 * @param secretNames - Array of secret names
 * @returns Object with secret names as keys and values
 */
export async function getSecrets(
  secretNames: string[]
): Promise<Record<string, string>> {
  const secrets: Record<string, string> = {};

  await Promise.all(
    secretNames.map(async (name) => {
      try {
        secrets[name] = await getSecret(name);
      } catch (error) {
        console.error(`Failed to retrieve secret: ${name}`, error);
      }
    })
  );

  return secrets;
}

/**
 * List all secret names in the Key Vault
 * @returns Array of secret names
 */
export async function listSecretNames(): Promise<string[]> {
  try {
    const client = getClient();
    const secretNames: string[] = [];

    for await (const secretProperties of client.listPropertiesOfSecrets()) {
      if (secretProperties.name) {
        secretNames.push(secretProperties.name);
      }
    }

    return secretNames;
  } catch (error) {
    console.error("Error listing secrets from Azure Key Vault:", error);
    throw error;
  }
}

/**
 * Get all application secrets from Azure Key Vault
 * Retrieves secrets with a specific prefix (e.g., 'vendorvault-')
 * @param prefix - Optional prefix to filter secrets
 */
export async function getAppSecrets(
  prefix?: string
): Promise<Record<string, string>> {
  try {
    const allSecretNames = await listSecretNames();

    // Filter by prefix if provided
    const filteredNames = prefix
      ? allSecretNames.filter((name) => name.startsWith(prefix))
      : allSecretNames;

    return await getSecrets(filteredNames);
  } catch (error) {
    console.error("Error retrieving app secrets:", error);
    throw error;
  }
}

/**
 * Load secrets into environment variables at runtime
 * @param secretMapping - Map of secret names to environment variable names
 */
export async function loadSecretsToEnv(
  secretMapping: Record<string, string>
): Promise<void> {
  if (!isKeyVaultConfigured()) {
    console.warn("Azure Key Vault not configured, skipping secret loading");
    return;
  }

  try {
    const secretNames = Object.keys(secretMapping);
    const secrets = await getSecrets(secretNames);

    // Inject secrets into process.env with mapped names
    Object.entries(secrets).forEach(([secretName, value]) => {
      const envVarName = secretMapping[secretName];
      if (envVarName && !process.env[envVarName]) {
        process.env[envVarName] = value;
      }
    });

    console.log(
      `✅ Loaded ${Object.keys(secrets).length} secrets from Azure Key Vault`
    );
  } catch (error) {
    console.error("Failed to load secrets from Azure Key Vault:", error);
    throw error;
  }
}

/**
 * Check if Azure Key Vault is configured
 */
export function isKeyVaultConfigured(): boolean {
  return !!(process.env.KEYVAULT_NAME || process.env.AZURE_KEYVAULT_NAME);
}

/**
 * Validate required secrets are present in Key Vault
 * @param requiredSecrets - Array of required secret names
 */
export async function validateSecrets(
  requiredSecrets: string[]
): Promise<boolean> {
  try {
    const secrets = await getSecrets(requiredSecrets);
    const missingSecrets = requiredSecrets.filter((name) => !secrets[name]);

    if (missingSecrets.length > 0) {
      console.error("Missing required secrets:", missingSecrets);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error validating secrets:", error);
    return false;
  }
}

/**
 * Get secret version information
 * @param secretName - Name of the secret
 */
export async function getSecretVersion(secretName: string) {
  try {
    const client = getClient();
    const secret = await client.getSecret(secretName);

    return {
      name: secret.name,
      version: secret.properties.version,
      createdOn: secret.properties.createdOn,
      updatedOn: secret.properties.updatedOn,
      enabled: secret.properties.enabled,
    };
  } catch (error) {
    console.error(`Error getting secret version for ${secretName}:`, error);
    throw error;
  }
}
