/**
 * Database Connection Test Script
 * Run: npm run test:db or node -r ts-node/register scripts/test-db-connection.ts
 */

import { runAllTests } from "../lib/db-test";

async function main() {
  try {
    const results = await runAllTests();

    if (results.allPassed) {
      console.log("🎉 All database tests passed successfully!");
      process.exit(0);
    } else {
      console.error(
        "⚠️  Some database tests failed. Please check the errors above."
      );
      process.exit(1);
    }
  } catch (error) {
    console.error("💥 Unexpected error during testing:", error);
    process.exit(1);
  }
}

main();
