import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";

const prisma = new PrismaClient();

/**
 * Test database connection using Prisma
 */
export async function testPrismaConnection() {
  try {
    console.log("🔄 Testing Prisma connection...");
    await prisma.$connect();

    // Test query
    const result =
      await prisma.$queryRaw`SELECT NOW() as server_time, version() as db_version`;
    console.log("✅ Prisma connection successful!");
    console.log("Server time:", result);

    // Test table access
    const userCount = await prisma.user.count();
    console.log(`📊 Total users in database: ${userCount}`);

    return { success: true, result };
  } catch (error) {
    console.error("❌ Prisma connection failed:", error);
    return { success: false, error };
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Test raw PostgreSQL connection
 */
export async function testRawConnection() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl:
      process.env.NODE_ENV === "production"
        ? { rejectUnauthorized: false }
        : false,
  });

  try {
    console.log("🔄 Testing raw PostgreSQL connection...");
    const client = await pool.connect();

    // Test basic query
    const result = await client.query(
      "SELECT NOW() as server_time, version() as db_version"
    );
    console.log("✅ Raw PostgreSQL connection successful!");
    console.log("Server time:", result.rows[0].server_time);
    console.log("Database version:", result.rows[0].db_version);

    // Test database info
    const dbInfo = await client.query(`
      SELECT 
        current_database() as database_name,
        current_user as current_user,
        inet_server_addr() as server_address,
        inet_server_port() as server_port
    `);
    console.log("📊 Database info:", dbInfo.rows[0]);

    client.release();
    return { success: true, result: result.rows[0], info: dbInfo.rows[0] };
  } catch (error) {
    console.error("❌ Raw PostgreSQL connection failed:", error);
    return { success: false, error };
  } finally {
    await pool.end();
  }
}

/**
 * Check database health and statistics
 */
export async function checkDatabaseHealth() {
  try {
    console.log("🔄 Checking database health...");

    // Check table sizes
    const tableSizes = await prisma.$queryRaw`
      SELECT 
        schemaname,
        tablename,
        pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
      FROM pg_tables
      WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
      ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
      LIMIT 10
    `;

    console.log("📊 Top 10 largest tables:");
    console.table(tableSizes);

    // Check connection pool status
    const poolStats = await prisma.$queryRaw`
      SELECT 
        count(*) as total_connections,
        count(*) FILTER (WHERE state = 'active') as active_connections,
        count(*) FILTER (WHERE state = 'idle') as idle_connections
      FROM pg_stat_activity
      WHERE datname = current_database()
    `;

    console.log("🔌 Connection pool status:");
    console.table(poolStats);

    return { success: true, tableSizes, poolStats };
  } catch (error) {
    console.error("❌ Health check failed:", error);
    return { success: false, error };
  }
}

/**
 * Run all database tests
 */
export async function runAllTests() {
  console.log("═══════════════════════════════════════");
  console.log("🚀 Starting Database Connection Tests");
  console.log("═══════════════════════════════════════\n");

  const prismaTest = await testPrismaConnection();
  console.log("\n");

  const rawTest = await testRawConnection();
  console.log("\n");

  const healthCheck = await checkDatabaseHealth();
  console.log("\n");

  console.log("═══════════════════════════════════════");
  console.log("📋 Test Summary");
  console.log("═══════════════════════════════════════");
  console.log(
    `Prisma Connection: ${prismaTest.success ? "✅ PASS" : "❌ FAIL"}`
  );
  console.log(`Raw Connection: ${rawTest.success ? "✅ PASS" : "❌ FAIL"}`);
  console.log(`Health Check: ${healthCheck.success ? "✅ PASS" : "❌ FAIL"}`);
  console.log("═══════════════════════════════════════\n");

  return {
    prismaTest,
    rawTest,
    healthCheck,
    allPassed: prismaTest.success && rawTest.success && healthCheck.success,
  };
}
