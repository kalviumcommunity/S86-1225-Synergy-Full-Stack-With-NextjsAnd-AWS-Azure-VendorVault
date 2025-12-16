# VendorVault API Testing - Windows PowerShell Script

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "VendorVault API Testing" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

$BASE_URL = "http://localhost:3000/api"

Write-Host "1. Testing GET /api/vendors (with pagination)" -ForegroundColor Yellow
Invoke-RestMethod -Uri "$BASE_URL/vendors?page=1&limit=5" -Method GET | ConvertTo-Json -Depth 10
Write-Host "`n"

Write-Host "2. Testing GET /api/vendors/1 (get specific vendor)" -ForegroundColor Yellow
Invoke-RestMethod -Uri "$BASE_URL/vendors/1" -Method GET | ConvertTo-Json -Depth 10
Write-Host "`n"

Write-Host "3. Testing GET /api/licenses (with status filter)" -ForegroundColor Yellow
Invoke-RestMethod -Uri "$BASE_URL/licenses?status=APPROVED&page=1&limit=5" -Method GET | ConvertTo-Json -Depth 10
Write-Host "`n"

Write-Host "4. Testing GET /api/licenses/1 (get specific license)" -ForegroundColor Yellow
Invoke-RestMethod -Uri "$BASE_URL/licenses/1" -Method GET | ConvertTo-Json -Depth 10
Write-Host "`n"

Write-Host "5. Testing GET /api/verify (verify license)" -ForegroundColor Yellow
Invoke-RestMethod -Uri "$BASE_URL/verify?licenseNumber=LIC-2025-001" -Method GET | ConvertTo-Json -Depth 10
Write-Host "`n"

Write-Host "6. Testing POST /api/vendor/apply (create vendor application)" -ForegroundColor Yellow
$vendorBody = @{
    userId = 1
    businessName = "Test Shop"
    stallType = "TEA_STALL"
    stationName = "Test Station"
    platformNumber = "1"
    city = "Mumbai"
    state = "Maharashtra"
} | ConvertTo-Json

Invoke-RestMethod -Uri "$BASE_URL/vendor/apply" -Method POST -Body $vendorBody -ContentType "application/json" | ConvertTo-Json -Depth 10
Write-Host "`n"

Write-Host "7. Testing POST /api/licenses (create license)" -ForegroundColor Yellow
$licenseBody = @{
    vendorId = 1
    licenseNumber = "LIC-TEST-001"
} | ConvertTo-Json

Invoke-RestMethod -Uri "$BASE_URL/licenses" -Method POST -Body $licenseBody -ContentType "application/json" | ConvertTo-Json -Depth 10
Write-Host "`n"

Write-Host "8. Testing POST /api/auth (login)" -ForegroundColor Yellow
$authBody = @{
    email = "vendor@example.com"
    password = "password123"
} | ConvertTo-Json

try {
    Invoke-RestMethod -Uri "$BASE_URL/auth" -Method POST -Body $authBody -ContentType "application/json" | ConvertTo-Json -Depth 10
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
}
Write-Host "`n"

Write-Host "9. Testing POST /api/license/approve (approve license)" -ForegroundColor Yellow
$approveBody = @{
    licenseId = 1
    approvedById = 1
    expiresAt = "2026-12-31T23:59:59Z"
} | ConvertTo-Json

Invoke-RestMethod -Uri "$BASE_URL/license/approve" -Method POST -Body $approveBody -ContentType "application/json" | ConvertTo-Json -Depth 10
Write-Host "`n"

Write-Host "10. Testing POST /api/license/generate-qr (generate QR code)" -ForegroundColor Yellow
$qrBody = @{
    licenseNumber = "LIC-2025-001"
} | ConvertTo-Json

Invoke-RestMethod -Uri "$BASE_URL/license/generate-qr" -Method POST -Body $qrBody -ContentType "application/json" | ConvertTo-Json -Depth 10
Write-Host "`n"

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Error Handling Tests" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "11. Testing 400 Bad Request (missing required fields)" -ForegroundColor Yellow
$badBody = @{
    businessName = "Test Shop"
} | ConvertTo-Json

try {
    Invoke-RestMethod -Uri "$BASE_URL/vendor/apply" -Method POST -Body $badBody -ContentType "application/json" | ConvertTo-Json -Depth 10
} catch {
    Write-Host "Expected Error (400): $_" -ForegroundColor Green
}
Write-Host "`n"

Write-Host "12. Testing 404 Not Found (non-existent vendor)" -ForegroundColor Yellow
try {
    Invoke-RestMethod -Uri "$BASE_URL/vendors/99999" -Method GET | ConvertTo-Json -Depth 10
} catch {
    Write-Host "Expected Error (404): $_" -ForegroundColor Green
}
Write-Host "`n"

Write-Host "13. Testing 400 Bad Request (invalid vendor ID)" -ForegroundColor Yellow
try {
    Invoke-RestMethod -Uri "$BASE_URL/vendors/invalid" -Method GET | ConvertTo-Json -Depth 10
} catch {
    Write-Host "Expected Error (400): $_" -ForegroundColor Green
}
Write-Host "`n"

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Testing Complete!" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
