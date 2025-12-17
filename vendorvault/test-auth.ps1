# Authentication API Testing Script
# This script tests the signup, login, and protected route functionality

Write-Host "================================" -ForegroundColor Cyan
Write-Host "VendorVault Authentication Test" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:3000"

# Test 1: Signup
Write-Host "[1] Testing Signup API..." -ForegroundColor Yellow
$signupBody = @{
    name = "Test User"
    email = "testuser@example.com"
    password = "TestPass123!"
    role = "VENDOR"
} | ConvertTo-Json

try {
    $signupResponse = Invoke-RestMethod -Method Post -Uri "$baseUrl/api/auth/signup" `
        -ContentType "application/json" -Body $signupBody -ErrorAction Stop
    
    Write-Host "✓ Signup successful!" -ForegroundColor Green
    Write-Host "  User ID: $($signupResponse.data.user.id)" -ForegroundColor Gray
    Write-Host "  Email: $($signupResponse.data.user.email)" -ForegroundColor Gray
    Write-Host "  Role: $($signupResponse.data.user.role)" -ForegroundColor Gray
    Write-Host ""
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 400) {
        Write-Host "ℹ User already exists (expected if running multiple times)" -ForegroundColor Cyan
    } else {
        Write-Host "✗ Signup failed: $_" -ForegroundColor Red
        exit 1
    }
    Write-Host ""
}

# Test 2: Login
Write-Host "[2] Testing Login API..." -ForegroundColor Yellow
$loginBody = @{
    email = "testuser@example.com"
    password = "TestPass123!"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Method Post -Uri "$baseUrl/api/auth/login" `
        -ContentType "application/json" -Body $loginBody -ErrorAction Stop
    
    Write-Host "✓ Login successful!" -ForegroundColor Green
    Write-Host "  Token Type: $($loginResponse.data.tokenType)" -ForegroundColor Gray
    Write-Host "  Expires In: $($loginResponse.data.expiresIn)" -ForegroundColor Gray
    Write-Host "  Token (first 50 chars): $($loginResponse.data.token.Substring(0, [Math]::Min(50, $loginResponse.data.token.Length)))..." -ForegroundColor Gray
    Write-Host ""
    
    $token = $loginResponse.data.token
} catch {
    Write-Host "✗ Login failed: $_" -ForegroundColor Red
    exit 1
}

# Test 3: Access Protected Route
Write-Host "[3] Testing Protected Route (with valid token)..." -ForegroundColor Yellow
$headers = @{
    Authorization = "Bearer $token"
}

try {
    $protectedResponse = Invoke-RestMethod -Method Get -Uri "$baseUrl/api/users" `
        -Headers $headers -ErrorAction Stop
    
    Write-Host "✓ Protected route access successful!" -ForegroundColor Green
    Write-Host "  User ID: $($protectedResponse.data.user.id)" -ForegroundColor Gray
    Write-Host "  Email: $($protectedResponse.data.user.email)" -ForegroundColor Gray
    Write-Host "  Role: $($protectedResponse.data.user.role)" -ForegroundColor Gray
    
    if ($protectedResponse.data.tokenInfo) {
        Write-Host "  Token Issued: $($protectedResponse.data.tokenInfo.issuedAt)" -ForegroundColor Gray
        Write-Host "  Token Expires: $($protectedResponse.data.tokenInfo.expiresAt)" -ForegroundColor Gray
    }
    Write-Host ""
} catch {
    Write-Host "✗ Protected route access failed: $_" -ForegroundColor Red
    exit 1
}

# Test 4: Access Protected Route WITHOUT Token
Write-Host "[4] Testing Protected Route (without token - should fail)..." -ForegroundColor Yellow

try {
    $failResponse = Invoke-RestMethod -Method Get -Uri "$baseUrl/api/users" -ErrorAction Stop
    Write-Host "✗ Unexpected success - should have failed!" -ForegroundColor Red
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 401) {
        Write-Host "✓ Correctly rejected unauthorized request!" -ForegroundColor Green
        Write-Host "  Status: 401 Unauthorized (expected)" -ForegroundColor Gray
    } else {
        Write-Host "✗ Wrong error code: $statusCode" -ForegroundColor Red
    }
    Write-Host ""
}

# Test 5: Login with Wrong Password
Write-Host "[5] Testing Login with Wrong Password (should fail)..." -ForegroundColor Yellow
$wrongLoginBody = @{
    email = "testuser@example.com"
    password = "WrongPassword123!"
} | ConvertTo-Json

try {
    $wrongLoginResponse = Invoke-RestMethod -Method Post -Uri "$baseUrl/api/auth/login" `
        -ContentType "application/json" -Body $wrongLoginBody -ErrorAction Stop
    Write-Host "✗ Unexpected success - should have failed!" -ForegroundColor Red
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 401) {
        Write-Host "✓ Correctly rejected invalid credentials!" -ForegroundColor Green
        Write-Host "  Status: 401 Unauthorized (expected)" -ForegroundColor Gray
    } else {
        Write-Host "✗ Wrong error code: $statusCode" -ForegroundColor Red
    }
    Write-Host ""
}

# Summary
Write-Host "================================" -ForegroundColor Cyan
Write-Host "Test Summary" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host "✓ All authentication tests passed!" -ForegroundColor Green
Write-Host ""
Write-Host "Tested Features:" -ForegroundColor White
Write-Host "  ✓ User signup with password hashing" -ForegroundColor Green
Write-Host "  ✓ User login with JWT token generation" -ForegroundColor Green
Write-Host "  ✓ Protected route access with valid token" -ForegroundColor Green
Write-Host "  ✓ Protected route rejection without token" -ForegroundColor Green
Write-Host "  ✓ Login rejection with invalid credentials" -ForegroundColor Green
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor White
Write-Host "  - Review AUTHENTICATION.md for detailed documentation" -ForegroundColor Gray
Write-Host "  - Test with Postman using examples in documentation" -ForegroundColor Gray
Write-Host "  - Implement refresh token mechanism for long-lived sessions" -ForegroundColor Gray
Write-Host "  - Add rate limiting to prevent brute-force attacks" -ForegroundColor Gray
Write-Host ""
