/*
  Warnings:

  - Adding composite indexes for query optimization
  - Adding missing single field indexes for frequently queried fields

*/
-- CreateIndex for Vendor table query optimization
CREATE INDEX "vendors_createdAt_idx" ON "vendors"("created_at");
CREATE INDEX "vendors_stationName_stallType_idx" ON "vendors"("station_name", "stall_type");

-- CreateIndex for License table query optimization
CREATE INDEX "licenses_createdAt_idx" ON "licenses"("created_at");
CREATE INDEX "licenses_status_expiresAt_idx" ON "licenses"("status", "expires_at");
CREATE INDEX "licenses_vendorId_status_idx" ON "licenses"("vendor_id", "status");

-- CreateIndex for Document table query optimization
CREATE INDEX "documents_uploadedAt_idx" ON "documents"("uploaded_at");
CREATE INDEX "documents_vendorId_documentType_idx" ON "documents"("vendor_id", "document_type");
CREATE INDEX "documents_vendorId_status_idx" ON "documents"("vendor_id", "status");

-- CreateIndex for Inspection table query optimization
CREATE INDEX "inspections_licenseId_status_idx" ON "inspections"("license_id", "status");
CREATE INDEX "inspections_inspectorId_inspectedAt_idx" ON "inspections"("inspector_id", "inspected_at");

-- CreateIndex for Notification table query optimization
CREATE INDEX "notifications_userId_isRead_idx" ON "notifications"("user_id", "is_read");
CREATE INDEX "notifications_userId_type_idx" ON "notifications"("user_id", "type");

-- CreateIndex for AuditLog table query optimization
CREATE INDEX "audit_logs_userId_action_idx" ON "audit_logs"("user_id", "action");
CREATE INDEX "audit_logs_entityType_action_idx" ON "audit_logs"("entity_type", "action");
