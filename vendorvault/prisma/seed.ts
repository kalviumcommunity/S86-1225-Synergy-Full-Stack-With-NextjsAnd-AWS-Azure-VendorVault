import {
  PrismaClient,
  UserRole,
  StallType,
  LicenseStatus,
  DocumentType,
} from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...\n");

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
  const admin1 = await prisma.user.create({
    data: {
      email: "admin@vendorvault.com",
      name: "Railway License Admin",
      passwordHash: hashedPassword,
      role: UserRole.ADMIN,
      emailVerified: true,
      phone: "+919876543210",
    },
  });

  const admin2 = await prisma.user.create({
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
  const inspector1 = await prisma.user.create({
    data: {
      email: "inspector1@vendorvault.com",
      name: "Inspector Rajesh Kumar",
      passwordHash: hashedPassword,
      role: UserRole.INSPECTOR,
      emailVerified: true,
      phone: "+919876543212",
    },
  });

  const inspector2 = await prisma.user.create({
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
  // 3. CREATE VENDOR USERS WITH LICENSES
  // ============================================
  console.log("🏪 Creating vendor users and licenses...\n");

  // Vendor 1: Tea Stall - APPROVED
  const vendor1User = await prisma.user.create({
    data: {
      email: "vendor1@example.com",
      name: "Ramesh Tea Stall",
      passwordHash: hashedPassword,
      role: UserRole.VENDOR,
      emailVerified: true,
      phone: "+919876543220",
    },
  });

  const vendor1 = await prisma.vendor.create({
    data: {
      userId: vendor1User.id,
      businessName: "Ramesh's Chai Corner",
      stallType: StallType.TEA_STALL,
      stationName: "New Delhi Railway Station",
      platformNumber: "Platform 1",
      stallLocationDescription: "Near the main entrance, left side",
      aadhaarNumber: "123456789012",
      panNumber: "ABCDE1234F",
      address: "Platform 1, New Delhi Railway Station",
      city: "New Delhi",
      state: "Delhi",
      pincode: "110001",
    },
  });

  const license1 = await prisma.license.create({
    data: {
      licenseNumber: "RL-2024-0001",
      vendorId: vendor1.id,
      status: LicenseStatus.APPROVED,
      approvedById: admin1.id,
      approvedAt: new Date("2024-01-15"),
      issuedAt: new Date("2024-01-15"),
      expiresAt: new Date("2025-01-14"),
      qrCodeData: "RL-2024-0001-QR-DATA",
      qrCodeUrl: "https://storage.example.com/qr/RL-2024-0001.png",
    },
  });

  await prisma.document.createMany({
    data: [
      {
        vendorId: vendor1.id,
        documentType: DocumentType.ID_PROOF_AADHAAR,
        fileName: "aadhaar_ramesh.pdf",
        fileUrl: "https://storage.example.com/docs/aadhaar_ramesh.pdf",
        storageKey: "docs/aadhaar_ramesh.pdf",
        status: "VERIFIED",
        fileSize: 1024000,
        mimeType: "application/pdf",
      },
      {
        vendorId: vendor1.id,
        documentType: DocumentType.STALL_PHOTO,
        fileName: "stall_photo_ramesh.jpg",
        fileUrl: "https://storage.example.com/docs/stall_photo_ramesh.jpg",
        storageKey: "docs/stall_photo_ramesh.jpg",
        status: "VERIFIED",
        fileSize: 2048000,
        mimeType: "image/jpeg",
      },
    ],
  });

  console.log("  ✅ Vendor 1: Tea Stall (APPROVED)");

  // Vendor 2: Snack Shop - APPROVED
  const vendor2User = await prisma.user.create({
    data: {
      email: "vendor2@example.com",
      name: "Suresh Snacks",
      passwordHash: hashedPassword,
      role: UserRole.VENDOR,
      emailVerified: true,
      phone: "+919876543221",
    },
  });

  const vendor2 = await prisma.vendor.create({
    data: {
      userId: vendor2User.id,
      businessName: "Suresh's Snack Corner",
      stallType: StallType.SNACK_SHOP,
      stationName: "Mumbai Central",
      platformNumber: "Platform 3",
      stallLocationDescription: "Near platform exit, right side",
      aadhaarNumber: "223456789012",
      panNumber: "BCDEF2345G",
      address: "Platform 3, Mumbai Central",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400008",
    },
  });

  const license2 = await prisma.license.create({
    data: {
      licenseNumber: "RL-2024-0002",
      vendorId: vendor2.id,
      status: LicenseStatus.APPROVED,
      approvedById: admin1.id,
      approvedAt: new Date("2024-02-01"),
      issuedAt: new Date("2024-02-01"),
      expiresAt: new Date("2025-01-31"),
      qrCodeData: "RL-2024-0002-QR-DATA",
      qrCodeUrl: "https://storage.example.com/qr/RL-2024-0002.png",
    },
  });

  await prisma.document.createMany({
    data: [
      {
        vendorId: vendor2.id,
        documentType: DocumentType.ID_PROOF_PAN,
        fileName: "pan_suresh.pdf",
        fileUrl: "https://storage.example.com/docs/pan_suresh.pdf",
        storageKey: "docs/pan_suresh.pdf",
        status: "VERIFIED",
        fileSize: 512000,
        mimeType: "application/pdf",
      },
    ],
  });

  console.log("  ✅ Vendor 2: Snack Shop (APPROVED)");

  // Vendor 3: Book Shop - PENDING
  const vendor3User = await prisma.user.create({
    data: {
      email: "vendor3@example.com",
      name: "Arvind Books",
      passwordHash: hashedPassword,
      role: UserRole.VENDOR,
      emailVerified: true,
      phone: "+919876543222",
    },
  });

  const vendor3 = await prisma.vendor.create({
    data: {
      userId: vendor3User.id,
      businessName: "Arvind's Book Stall",
      stallType: StallType.BOOK_SHOP,
      stationName: "Bangalore City Railway Station",
      platformNumber: "Platform 5",
      stallLocationDescription: "Near waiting room",
      aadhaarNumber: "323456789012",
      panNumber: "CDEFG3456H",
      address: "Platform 5, Bangalore City",
      city: "Bangalore",
      state: "Karnataka",
      pincode: "560001",
    },
  });

  const license3 = await prisma.license.create({
    data: {
      licenseNumber: "RL-2024-0003",
      vendorId: vendor3.id,
      status: LicenseStatus.PENDING,
    },
  });

  await prisma.document.createMany({
    data: [
      {
        vendorId: vendor3.id,
        documentType: DocumentType.ID_PROOF_AADHAAR,
        fileName: "aadhaar_arvind.pdf",
        fileUrl: "https://storage.example.com/docs/aadhaar_arvind.pdf",
        storageKey: "docs/aadhaar_arvind.pdf",
        status: "PENDING",
        fileSize: 1024000,
        mimeType: "application/pdf",
      },
    ],
  });

  console.log("  ✅ Vendor 3: Book Shop (PENDING)");

  // Vendor 4: Magazine Stand - REJECTED
  const vendor4User = await prisma.user.create({
    data: {
      email: "vendor4@example.com",
      name: "Kiran Magazines",
      passwordHash: hashedPassword,
      role: UserRole.VENDOR,
      emailVerified: false,
      phone: "+919876543223",
    },
  });

  const vendor4 = await prisma.vendor.create({
    data: {
      userId: vendor4User.id,
      businessName: "Kiran's Magazine Stand",
      stallType: StallType.MAGAZINE_STAND,
      stationName: "Chennai Central",
      platformNumber: "Platform 2",
      stallLocationDescription: "Near ticket counter",
      aadhaarNumber: "423456789012",
      panNumber: "DEFGH4567I",
      address: "Platform 2, Chennai Central",
      city: "Chennai",
      state: "Tamil Nadu",
      pincode: "600003",
    },
  });

  const license4 = await prisma.license.create({
    data: {
      licenseNumber: "RL-2024-0004",
      vendorId: vendor4.id,
      status: LicenseStatus.REJECTED,
      approvedById: admin2.id,
      rejectionReason:
        "Incomplete documentation. Police verification certificate not provided.",
    },
  });

  await prisma.document.create({
    data: {
      vendorId: vendor4.id,
      documentType: DocumentType.ID_PROOF_AADHAAR,
      fileName: "aadhaar_kiran.pdf",
      fileUrl: "https://storage.example.com/docs/aadhaar_kiran.pdf",
      storageKey: "docs/aadhaar_kiran.pdf",
      status: "REJECTED",
      verificationNotes: "Document is unclear and unreadable",
      fileSize: 1024000,
      mimeType: "application/pdf",
    },
  });

  console.log("  ✅ Vendor 4: Magazine Stand (REJECTED)");

  // Vendor 5: Fast Food - EXPIRING SOON
  const vendor5User = await prisma.user.create({
    data: {
      email: "vendor5@example.com",
      name: "Mohan Fast Food",
      passwordHash: hashedPassword,
      role: UserRole.VENDOR,
      emailVerified: true,
      phone: "+919876543224",
    },
  });

  const vendor5 = await prisma.vendor.create({
    data: {
      userId: vendor5User.id,
      businessName: "Mohan's Quick Bites",
      stallType: StallType.FAST_FOOD,
      stationName: "Kolkata Howrah",
      platformNumber: "Platform 7",
      stallLocationDescription: "Near food plaza",
      aadhaarNumber: "523456789012",
      panNumber: "EFGHI5678J",
      gstNumber: "GST123456789",
      address: "Platform 7, Howrah Station",
      city: "Kolkata",
      state: "West Bengal",
      pincode: "711101",
    },
  });

  // License expiring in 15 days
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + 15);

  const license5 = await prisma.license.create({
    data: {
      licenseNumber: "RL-2023-0015",
      vendorId: vendor5.id,
      status: LicenseStatus.APPROVED,
      approvedById: admin1.id,
      approvedAt: new Date("2023-01-15"),
      issuedAt: new Date("2023-01-15"),
      expiresAt: expiryDate,
      qrCodeData: "RL-2023-0015-QR-DATA",
      qrCodeUrl: "https://storage.example.com/qr/RL-2023-0015.png",
    },
  });

  await prisma.document.createMany({
    data: [
      {
        vendorId: vendor5.id,
        documentType: DocumentType.ID_PROOF_AADHAAR,
        fileName: "aadhaar_mohan.pdf",
        fileUrl: "https://storage.example.com/docs/aadhaar_mohan.pdf",
        storageKey: "docs/aadhaar_mohan.pdf",
        status: "VERIFIED",
        fileSize: 1024000,
        mimeType: "application/pdf",
      },
      {
        vendorId: vendor5.id,
        documentType: DocumentType.GST_CERTIFICATE,
        fileName: "gst_mohan.pdf",
        fileUrl: "https://storage.example.com/docs/gst_mohan.pdf",
        storageKey: "docs/gst_mohan.pdf",
        status: "VERIFIED",
        fileSize: 768000,
        mimeType: "application/pdf",
      },
    ],
  });

  console.log("  ✅ Vendor 5: Fast Food (EXPIRING SOON)");

  console.log("\n✅ Created 5 vendors with different license statuses\n");

  // ============================================
  // 4. CREATE INSPECTIONS
  // ============================================
  console.log("🔍 Creating inspection records...");

  await prisma.inspection.create({
    data: {
      licenseId: license1.id,
      inspectorId: inspector1.id,
      status: "COMPLIANT",
      remarks:
        "Stall is clean and well-maintained. All documents are in order.",
      hygieneIssue: false,
      locationIssue: false,
      documentIssue: false,
      inspectionLocation: "New Delhi Railway Station, Platform 1",
      inspectedAt: new Date("2024-06-15"),
    },
  });

  await prisma.inspection.create({
    data: {
      licenseId: license2.id,
      inspectorId: inspector2.id,
      status: "NON_COMPLIANT",
      remarks: "Minor hygiene issues observed. Warning issued.",
      hygieneIssue: true,
      locationIssue: false,
      documentIssue: false,
      otherIssue: "Dustbin not properly maintained",
      inspectionLocation: "Mumbai Central, Platform 3",
      inspectedAt: new Date("2024-07-20"),
    },
  });

  console.log("✅ Created 2 inspection records\n");

  // ============================================
  // 5. CREATE NOTIFICATIONS
  // ============================================
  console.log("📧 Creating notifications...");

  await prisma.notification.createMany({
    data: [
      {
        userId: vendor1User.id,
        type: "APPLICATION_APPROVED",
        channel: "EMAIL",
        title: "License Approved!",
        message:
          "Your license application has been approved. License Number: RL-2024-0001",
        licenseId: license1.id,
        isRead: true,
        isSent: true,
        sentAt: new Date("2024-01-15"),
      },
      {
        userId: vendor5User.id,
        type: "LICENSE_EXPIRING_SOON",
        channel: "EMAIL",
        title: "License Expiring Soon",
        message:
          "Your license will expire in 15 days. Please renew it to continue operations.",
        licenseId: license5.id,
        isRead: false,
        isSent: true,
        sentAt: new Date(),
      },
      {
        userId: vendor4User.id,
        type: "APPLICATION_REJECTED",
        channel: "EMAIL",
        title: "License Application Rejected",
        message:
          "Your application has been rejected. Reason: Incomplete documentation.",
        licenseId: license4.id,
        isRead: false,
        isSent: true,
        sentAt: new Date("2024-03-10"),
      },
    ],
  });

  console.log("✅ Created 3 notifications\n");

  // ============================================
  // 6. CREATE AUDIT LOGS
  // ============================================
  console.log("📝 Creating audit logs...");

  await prisma.auditLog.createMany({
    data: [
      {
        userId: admin1.id,
        action: "APPROVE",
        entityType: "License",
        entityId: license1.id,
        newValues: { status: "APPROVED", licenseNumber: "RL-2024-0001" },
        ipAddress: "192.168.1.100",
        userAgent: "Mozilla/5.0",
        createdAt: new Date("2024-01-15"),
      },
      {
        userId: admin2.id,
        action: "REJECT",
        entityType: "License",
        entityId: license4.id,
        oldValues: { status: "PENDING" },
        newValues: { status: "REJECTED" },
        ipAddress: "192.168.1.101",
        userAgent: "Mozilla/5.0",
        createdAt: new Date("2024-03-10"),
      },
    ],
  });

  console.log("✅ Created audit logs\n");

  // ============================================
  // SUMMARY
  // ============================================
  console.log("📊 Seeding Summary:");
  console.log("  ✅ 2 Admin users");
  console.log("  ✅ 2 Inspector users");
  console.log("  ✅ 5 Vendor users with licenses:");
  console.log("     - 2 APPROVED (1 expiring soon)");
  console.log("     - 1 PENDING");
  console.log("     - 1 REJECTED");
  console.log("  ✅ 8 Documents");
  console.log("  ✅ 2 Inspections");
  console.log("  ✅ 3 Notifications");
  console.log("  ✅ 2 Audit Logs");
  console.log("\n🎉 Database seeded successfully!");
  console.log("\n📝 Login Credentials:");
  console.log("  Admin: admin@vendorvault.com / Password123!");
  console.log("  Inspector: inspector1@vendorvault.com / Password123!");
  console.log("  Vendor: vendor1@example.com / Password123!");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
