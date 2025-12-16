# VendorVault API Testing Script
# Run these commands to test the API endpoints

echo "========================================="
echo "VendorVault API Testing"
echo "========================================="
echo ""

# Base URL
BASE_URL="http://localhost:3000/api"

echo "1. Testing GET /api/vendors (with pagination)"
curl -X GET "$BASE_URL/vendors?page=1&limit=5"
echo -e "\n\n"

echo "2. Testing GET /api/vendors/1 (get specific vendor)"
curl -X GET "$BASE_URL/vendors/1"
echo -e "\n\n"

echo "3. Testing GET /api/licenses (with status filter)"
curl -X GET "$BASE_URL/licenses?status=APPROVED&page=1&limit=5"
echo -e "\n\n"

echo "4. Testing GET /api/licenses/1 (get specific license)"
curl -X GET "$BASE_URL/licenses/1"
echo -e "\n\n"

echo "5. Testing GET /api/verify (verify license)"
curl -X GET "$BASE_URL/verify?licenseNumber=LIC-2025-001"
echo -e "\n\n"

echo "6. Testing POST /api/vendor/apply (create vendor application)"
curl -X POST "$BASE_URL/vendor/apply" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "businessName": "Test Shop",
    "stallType": "TEA_STALL",
    "stationName": "Test Station",
    "platformNumber": "1",
    "city": "Mumbai",
    "state": "Maharashtra"
  }'
echo -e "\n\n"

echo "7. Testing POST /api/licenses (create license)"
curl -X POST "$BASE_URL/licenses" \
  -H "Content-Type: application/json" \
  -d '{
    "vendorId": 1,
    "licenseNumber": "LIC-TEST-001"
  }'
echo -e "\n\n"

echo "8. Testing POST /api/auth (login)"
curl -X POST "$BASE_URL/auth" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "vendor@example.com",
    "password": "password123"
  }'
echo -e "\n\n"

echo "9. Testing POST /api/license/approve (approve license)"
curl -X POST "$BASE_URL/license/approve" \
  -H "Content-Type: application/json" \
  -d '{
    "licenseId": 1,
    "approvedById": 1,
    "expiresAt": "2026-12-31T23:59:59Z"
  }'
echo -e "\n\n"

echo "10. Testing POST /api/license/generate-qr (generate QR code)"
curl -X POST "$BASE_URL/license/generate-qr" \
  -H "Content-Type: application/json" \
  -d '{
    "licenseNumber": "LIC-2025-001"
  }'
echo -e "\n\n"

echo "========================================="
echo "Error Handling Tests"
echo "========================================="
echo ""

echo "11. Testing 400 Bad Request (missing required fields)"
curl -X POST "$BASE_URL/vendor/apply" \
  -H "Content-Type: application/json" \
  -d '{
    "businessName": "Test Shop"
  }'
echo -e "\n\n"

echo "12. Testing 404 Not Found (non-existent vendor)"
curl -X GET "$BASE_URL/vendors/99999"
echo -e "\n\n"

echo "13. Testing 400 Bad Request (invalid vendor ID)"
curl -X GET "$BASE_URL/vendors/invalid"
echo -e "\n\n"

echo "========================================="
echo "Testing Complete!"
echo "========================================="
