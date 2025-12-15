import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...\n");
  console.log("ℹ️  Note: Only Admin and Inspector users will be seeded.");
  console.log("ℹ️  Vendors should register through the application.\n");

  // Clear existing data (be careful in production!)
  console.log("🗑️  Clearing existing data...");
  await prisma.auditLog.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.inspection.deleteMany({});
  await prisma.document.deleteMany({});
  await prisma.license.deleteMany({});
  await prisma.vendor.deleteMany({});
  await prisma.user.deleteMany({});
  console.log("✅ Existing data cleared\n");

  // Hash password for all users
  const hashedPassword = await bcrypt.hash("Password123!", 10);

  // ============================================
  // 1. CREATE ADMIN USERS
  // ============================================
  console.log("👤 Creating admin users...");
  await prisma.user.create({
    data: {
      email: "admin@vendorvault.com",
      name: "Railway License Admin",
      passwordHash: hashedPassword,
      role: UserRole.ADMIN,
      emailVerified: true,
      phone: "+919876543210",
    },
  });

  await prisma.user.create({
    data: {
      email: "admin2@vendorvault.com",
      name: "Senior License Officer",
      passwordHash: hashedPassword,
      role: UserRole.ADMIN,
      emailVerified: true,
      phone: "+919876543211",
    },
  });
  console.log("✅ Created 2 admin users\n");

  // ============================================
  // 2. CREATE INSPECTOR USERS
  // ============================================
  console.log("🔍 Creating inspector users...");
  await prisma.user.create({
    data: {
      email: "inspector1@vendorvault.com",
      name: "Inspector Rajesh Kumar",
      passwordHash: hashedPassword,
      role: UserRole.INSPECTOR,
      emailVerified: true,
      phone: "+919876543212",
    },
  });

  await prisma.user.create({
    data: {
      email: "inspector2@vendorvault.com",
      name: "Inspector Priya Sharma",
      passwordHash: hashedPassword,
      role: UserRole.INSPECTOR,
      emailVerified: true,
      phone: "+919876543213",
    },
  });
  console.log("✅ Created 2 inspector users\n");

  // ============================================
  // SUMMARY
  // ============================================
  console.log("📊 Seeding Summary:");
  console.log("  ✅ 2 Admin users");
  console.log("  ✅ 2 Inspector users");
  console.log("  ℹ️  Vendors will register through the application");
  console.log("\n🎉 Database seeded successfully!");
  console.log("\n📝 Login Credentials:");
  console.log("  Admin: admin@vendorvault.com / Password123!");
  console.log("  Admin: admin2@vendorvault.com / Password123!");
  console.log("  Inspector: inspector1@vendorvault.com / Password123!");
  console.log("  Inspector: inspector2@vendorvault.com / Password123!");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
