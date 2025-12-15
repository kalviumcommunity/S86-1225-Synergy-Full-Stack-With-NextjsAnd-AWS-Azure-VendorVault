-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('VENDOR', 'ADMIN', 'INSPECTOR');

-- CreateEnum
CREATE TYPE "StallType" AS ENUM ('TEA_STALL', 'SNACK_SHOP', 'BOOK_SHOP', 'MAGAZINE_STAND', 'FRUIT_SHOP', 'GENERAL_STORE', 'FAST_FOOD', 'ELECTRONICS', 'CLOTHING', 'OTHER');

-- CreateEnum
CREATE TYPE "LicenseStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'EXPIRED', 'REVOKED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('ID_PROOF_AADHAAR', 'ID_PROOF_PAN', 'ID_PROOF_VOTER_ID', 'ID_PROOF_DRIVING_LICENSE', 'POLICE_VERIFICATION', 'BUSINESS_REGISTRATION', 'GST_CERTIFICATE', 'STALL_PHOTO', 'PREVIOUS_LICENSE', 'OTHER');

-- CreateEnum
CREATE TYPE "DocumentStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');

-- CreateEnum
CREATE TYPE "InspectionStatus" AS ENUM ('COMPLIANT', 'NON_COMPLIANT', 'WARNING_ISSUED', 'FINE_IMPOSED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('APPLICATION_SUBMITTED', 'APPLICATION_APPROVED', 'APPLICATION_REJECTED', 'LICENSE_EXPIRING_SOON', 'LICENSE_EXPIRED', 'LICENSE_REVOKED', 'INSPECTION_SCHEDULED', 'INSPECTION_COMPLETED', 'DOCUMENT_VERIFIED', 'DOCUMENT_REJECTED', 'RENEWAL_REMINDER');

-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('EMAIL', 'SMS', 'IN_APP');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'APPROVE', 'REJECT', 'REVOKE', 'SUSPEND', 'VERIFY');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "password_hash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'VENDOR',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendors" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "business_name" TEXT NOT NULL,
    "stall_type" "StallType" NOT NULL,
    "stall_description" TEXT,
    "station_name" TEXT NOT NULL,
    "platform_number" TEXT,
    "stall_location_description" TEXT,
    "stall_photo_url" TEXT,
    "aadhaar_number" TEXT,
    "pan_number" TEXT,
    "gst_number" TEXT,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "pincode" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vendors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "licenses" (
    "id" SERIAL NOT NULL,
    "license_number" TEXT NOT NULL,
    "vendor_id" INTEGER NOT NULL,
    "status" "LicenseStatus" NOT NULL DEFAULT 'PENDING',
    "approved_by_id" INTEGER,
    "approved_at" TIMESTAMP(3),
    "issued_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3),
    "rejection_reason" TEXT,
    "revocation_reason" TEXT,
    "qr_code_data" TEXT,
    "qr_code_url" TEXT,
    "is_renewal" BOOLEAN NOT NULL DEFAULT false,
    "previous_license_id" INTEGER,
    "remarks" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "licenses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" SERIAL NOT NULL,
    "vendor_id" INTEGER NOT NULL,
    "document_type" "DocumentType" NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "file_size" INTEGER,
    "mime_type" TEXT,
    "status" "DocumentStatus" NOT NULL DEFAULT 'PENDING',
    "verification_notes" TEXT,
    "storage_key" TEXT NOT NULL,
    "storage_bucket" TEXT,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inspections" (
    "id" SERIAL NOT NULL,
    "license_id" INTEGER NOT NULL,
    "inspector_id" INTEGER NOT NULL,
    "status" "InspectionStatus" NOT NULL,
    "remarks" TEXT,
    "hygiene_issue" BOOLEAN NOT NULL DEFAULT false,
    "location_issue" BOOLEAN NOT NULL DEFAULT false,
    "document_issue" BOOLEAN NOT NULL DEFAULT false,
    "other_issue" TEXT,
    "fine_amount" DECIMAL(10,2),
    "action_taken" TEXT,
    "inspection_location" TEXT,
    "inspected_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "photo_urls" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inspections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "type" "NotificationType" NOT NULL,
    "channel" "NotificationChannel" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "license_id" INTEGER,
    "inspection_id" INTEGER,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "is_sent" BOOLEAN NOT NULL DEFAULT false,
    "sent_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER,
    "action" "AuditAction" NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" INTEGER NOT NULL,
    "old_values" JSONB,
    "new_values" JSONB,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE UNIQUE INDEX "vendors_user_id_key" ON "vendors"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "vendors_aadhaar_number_key" ON "vendors"("aadhaar_number");

-- CreateIndex
CREATE UNIQUE INDEX "vendors_pan_number_key" ON "vendors"("pan_number");

-- CreateIndex
CREATE INDEX "vendors_user_id_idx" ON "vendors"("user_id");

-- CreateIndex
CREATE INDEX "vendors_station_name_idx" ON "vendors"("station_name");

-- CreateIndex
CREATE INDEX "vendors_stall_type_idx" ON "vendors"("stall_type");

-- CreateIndex
CREATE UNIQUE INDEX "licenses_license_number_key" ON "licenses"("license_number");

-- CreateIndex
CREATE UNIQUE INDEX "licenses_qr_code_data_key" ON "licenses"("qr_code_data");

-- CreateIndex
CREATE INDEX "licenses_vendor_id_idx" ON "licenses"("vendor_id");

-- CreateIndex
CREATE INDEX "licenses_status_idx" ON "licenses"("status");

-- CreateIndex
CREATE INDEX "licenses_license_number_idx" ON "licenses"("license_number");

-- CreateIndex
CREATE INDEX "licenses_expires_at_idx" ON "licenses"("expires_at");

-- CreateIndex
CREATE INDEX "licenses_approved_by_id_idx" ON "licenses"("approved_by_id");

-- CreateIndex
CREATE INDEX "documents_vendor_id_idx" ON "documents"("vendor_id");

-- CreateIndex
CREATE INDEX "documents_document_type_idx" ON "documents"("document_type");

-- CreateIndex
CREATE INDEX "documents_status_idx" ON "documents"("status");

-- CreateIndex
CREATE INDEX "inspections_license_id_idx" ON "inspections"("license_id");

-- CreateIndex
CREATE INDEX "inspections_inspector_id_idx" ON "inspections"("inspector_id");

-- CreateIndex
CREATE INDEX "inspections_status_idx" ON "inspections"("status");

-- CreateIndex
CREATE INDEX "inspections_inspected_at_idx" ON "inspections"("inspected_at");

-- CreateIndex
CREATE INDEX "notifications_user_id_idx" ON "notifications"("user_id");

-- CreateIndex
CREATE INDEX "notifications_type_idx" ON "notifications"("type");

-- CreateIndex
CREATE INDEX "notifications_is_read_idx" ON "notifications"("is_read");

-- CreateIndex
CREATE INDEX "notifications_created_at_idx" ON "notifications"("created_at");

-- CreateIndex
CREATE INDEX "audit_logs_user_id_idx" ON "audit_logs"("user_id");

-- CreateIndex
CREATE INDEX "audit_logs_entity_type_entity_id_idx" ON "audit_logs"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");

-- CreateIndex
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs"("created_at");

-- AddForeignKey
ALTER TABLE "vendors" ADD CONSTRAINT "vendors_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "licenses" ADD CONSTRAINT "licenses_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "licenses" ADD CONSTRAINT "licenses_approved_by_id_fkey" FOREIGN KEY ("approved_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "licenses" ADD CONSTRAINT "licenses_previous_license_id_fkey" FOREIGN KEY ("previous_license_id") REFERENCES "licenses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inspections" ADD CONSTRAINT "inspections_license_id_fkey" FOREIGN KEY ("license_id") REFERENCES "licenses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inspections" ADD CONSTRAINT "inspections_inspector_id_fkey" FOREIGN KEY ("inspector_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
