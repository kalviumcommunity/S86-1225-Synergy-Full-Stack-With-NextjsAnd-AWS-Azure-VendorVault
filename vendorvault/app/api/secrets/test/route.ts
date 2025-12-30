import { NextRequest, NextResponse } from "next/server";
import {
  getAppSecrets,
  isSecretsManagerConfigured,
} from "@/lib/secrets-manager";
import {
  getAppSecrets as getKeyVaultSecrets,
  isKeyVaultConfigured,
} from "@/lib/keyvault";

/**
 * GET /api/secrets/test
 * Test secret retrieval from AWS Secrets Manager or Azure Key Vault
 *
 * SECURITY WARNING: This endpoint is for testing only!
 * Remove or protect this endpoint in production.
 */
export async function GET(request: NextRequest) {
  try {
    // Check authorization (basic example - implement proper auth)
    const authHeader = request.headers.get("authorization");
    const expectedToken =
      process.env.SECRETS_TEST_TOKEN || "test-token-change-me";

    if (authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
          message:
            "Set SECRETS_TEST_TOKEN in your environment and provide it as Bearer token",
        },
        { status: 401 }
      );
    }

    const results: {
      provider: string;
      configured: boolean;
      secretsRetrieved?: number;
      secretKeys?: string[];
      error?: string;
    }[] = [];

    // Test AWS Secrets Manager
    if (isSecretsManagerConfigured()) {
      try {
        const secrets = await getAppSecrets();
        results.push({
          provider: "AWS Secrets Manager",
          configured: true,
          secretsRetrieved: Object.keys(secrets).length,
          secretKeys: Object.keys(secrets), // Only show keys, not values!
        });
      } catch (error) {
        results.push({
          provider: "AWS Secrets Manager",
          configured: true,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    } else {
      results.push({
        provider: "AWS Secrets Manager",
        configured: false,
      });
    }

    // Test Azure Key Vault
    if (isKeyVaultConfigured()) {
      try {
        const secrets = await getKeyVaultSecrets();
        results.push({
          provider: "Azure Key Vault",
          configured: true,
          secretsRetrieved: Object.keys(secrets).length,
          secretKeys: Object.keys(secrets), // Only show keys, not values!
        });
      } catch (error) {
        results.push({
          provider: "Azure Key Vault",
          configured: true,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    } else {
      results.push({
        provider: "Azure Key Vault",
        configured: false,
      });
    }

    // Check if at least one provider is configured
    const anyConfigured = results.some((r) => r.configured);

    return NextResponse.json({
      success: true,
      message: anyConfigured
        ? "Secret retrieval tested successfully"
        : "No secret providers configured",
      results,
      warning:
        "This endpoint exposes secret keys. Disable in production or implement proper authentication.",
    });
  } catch (error) {
    console.error("Error testing secret retrieval:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to test secret retrieval",
      },
      { status: 500 }
    );
  }
}
