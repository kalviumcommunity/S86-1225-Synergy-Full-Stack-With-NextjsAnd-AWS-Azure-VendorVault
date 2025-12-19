# ============================================
# Redis Caching Performance Test Script
# ============================================

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "  VendorVault Redis Caching Tests" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

$BASE_URL = "http://localhost:3000"
$results = @()

# Function to make API request and measure time
function Test-ApiEndpoint {
    param (
        [string]$Name,
        [string]$Url,
        [string]$Token,
        [string]$Method = "GET"
    )
    
    Write-Host "Testing: $Name" -ForegroundColor Yellow
    $start = Get-Date
    
    try {
        $response = Invoke-RestMethod -Uri $Url -Method $Method -Headers @{
            "Authorization" = "Bearer $Token"
        } -ErrorAction Stop
        
        $elapsed = ((Get-Date) - $start).TotalMilliseconds
        Write-Host "  ✅ Success - Response Time: $([math]::Round($elapsed, 2))ms" -ForegroundColor Green
        
        return @{
            Name = $Name
            Success = $true
            ResponseTime = [math]::Round($elapsed, 2)
            Status = "OK"
        }
    }
    catch {
        $elapsed = ((Get-Date) - $start).TotalMilliseconds
        Write-Host "  ❌ Failed - $_" -ForegroundColor Red
        
        return @{
            Name = $Name
            Success = $false
            ResponseTime = [math]::Round($elapsed, 2)
            Status = "Failed"
        }
    }
}

# Check if server is running
Write-Host "Checking if server is running..." -ForegroundColor Yellow
try {
    $healthCheck = Invoke-RestMethod -Uri "$BASE_URL/api/auth/login" -Method POST -Headers @{
        "Content-Type" = "application/json"
    } -Body (@{ email = "test"; password = "test" } | ConvertTo-Json) -ErrorAction SilentlyContinue
}
catch {
    if ($_.Exception.Response.StatusCode -eq 400 -or $_.Exception.Response.StatusCode -eq 401) {
        Write-Host "✅ Server is running" -ForegroundColor Green
    }
    else {
        Write-Host "❌ Server not running. Please start with: npm run dev" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""

# ============================================
# Step 1: Login
# ============================================
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "Step 1: Authentication" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

Write-Host "Logging in as admin..." -ForegroundColor Yellow
try {
    $loginResponse = Invoke-RestMethod -Uri "$BASE_URL/api/auth/login" -Method POST -Headers @{
        "Content-Type" = "application/json"
    } -Body (@{
        email = "admin@vendorvault.com"
        password = "Admin@123"
    } | ConvertTo-Json)

    $TOKEN = $loginResponse.data.token
    Write-Host "✅ Login successful" -ForegroundColor Green
    Write-Host "   Token: $($TOKEN.Substring(0, 20))..." -ForegroundColor Gray
}
catch {
    Write-Host "❌ Login failed. Please check credentials or seed database." -ForegroundColor Red
    Write-Host "   Run: npx prisma db seed" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Start-Sleep -Milliseconds 500

# ============================================
# Step 2: Test User Endpoint Caching
# ============================================
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "Step 2: User Endpoint Cache Test" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

Write-Host ""
Write-Host "🔥 Cold Start (Cache Miss)" -ForegroundColor Magenta
$result1 = Test-ApiEndpoint -Name "User Info (1st request)" -Url "$BASE_URL/api/users" -Token $TOKEN
$results += $result1
Start-Sleep -Milliseconds 500

Write-Host ""
Write-Host "⚡ Cache Hit" -ForegroundColor Magenta
$result2 = Test-ApiEndpoint -Name "User Info (2nd request)" -Url "$BASE_URL/api/users" -Token $TOKEN
$results += $result2

if ($result1.Success -and $result2.Success) {
    $improvement = [math]::Round($result1.ResponseTime / $result2.ResponseTime, 2)
    Write-Host ""
    Write-Host "  📊 Performance Improvement: ${improvement}x faster" -ForegroundColor Cyan
    Write-Host "     Cold Start: $($result1.ResponseTime)ms" -ForegroundColor Gray
    Write-Host "     Cached:     $($result2.ResponseTime)ms" -ForegroundColor Gray
}

Write-Host ""
Start-Sleep -Milliseconds 500

# ============================================
# Step 3: Test Vendors Endpoint Caching
# ============================================
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "Step 3: Vendors Endpoint Cache Test" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

Write-Host ""
Write-Host "🔥 Cold Start (Cache Miss)" -ForegroundColor Magenta
$result3 = Test-ApiEndpoint -Name "Vendors List (1st request)" -Url "$BASE_URL/api/vendors?page=1&limit=10" -Token $TOKEN
$results += $result3
Start-Sleep -Milliseconds 500

Write-Host ""
Write-Host "⚡ Cache Hit" -ForegroundColor Magenta
$result4 = Test-ApiEndpoint -Name "Vendors List (2nd request)" -Url "$BASE_URL/api/vendors?page=1&limit=10" -Token $TOKEN
$results += $result4

if ($result3.Success -and $result4.Success) {
    $improvement = [math]::Round($result3.ResponseTime / $result4.ResponseTime, 2)
    Write-Host ""
    Write-Host "  📊 Performance Improvement: ${improvement}x faster" -ForegroundColor Cyan
    Write-Host "     Cold Start: $($result3.ResponseTime)ms" -ForegroundColor Gray
    Write-Host "     Cached:     $($result4.ResponseTime)ms" -ForegroundColor Gray
}

Write-Host ""
Start-Sleep -Milliseconds 500

# ============================================
# Step 4: Test Licenses Endpoint Caching
# ============================================
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "Step 4: Licenses Endpoint Cache Test" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

Write-Host ""
Write-Host "🔥 Cold Start (Cache Miss)" -ForegroundColor Magenta
$result5 = Test-ApiEndpoint -Name "Licenses List (1st request)" -Url "$BASE_URL/api/licenses?page=1&limit=10" -Token $TOKEN
$results += $result5
Start-Sleep -Milliseconds 500

Write-Host ""
Write-Host "⚡ Cache Hit" -ForegroundColor Magenta
$result6 = Test-ApiEndpoint -Name "Licenses List (2nd request)" -Url "$BASE_URL/api/licenses?page=1&limit=10" -Token $TOKEN
$results += $result6

if ($result5.Success -and $result6.Success) {
    $improvement = [math]::Round($result5.ResponseTime / $result6.ResponseTime, 2)
    Write-Host ""
    Write-Host "  📊 Performance Improvement: ${improvement}x faster" -ForegroundColor Cyan
    Write-Host "     Cold Start: $($result5.ResponseTime)ms" -ForegroundColor Gray
    Write-Host "     Cached:     $($result6.ResponseTime)ms" -ForegroundColor Gray
}

Write-Host ""
Start-Sleep -Milliseconds 500

# ============================================
# Step 5: Test Different Query Parameters
# ============================================
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "Step 5: Cache Key Variation Test" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "Testing different pagination (should miss cache)..." -ForegroundColor Yellow

$result7 = Test-ApiEndpoint -Name "Vendors List (page 2)" -Url "$BASE_URL/api/vendors?page=2&limit=10" -Token $TOKEN
$results += $result7

Write-Host "  ℹ️  Different parameters = different cache key" -ForegroundColor Gray

Write-Host ""
Start-Sleep -Milliseconds 500

# ============================================
# Summary Report
# ============================================
Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "  Test Summary" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

$successCount = ($results | Where-Object { $_.Success }).Count
$totalCount = $results.Count

Write-Host "Total Tests: $totalCount" -ForegroundColor White
Write-Host "Passed:      $successCount" -ForegroundColor Green
Write-Host "Failed:      $($totalCount - $successCount)" -ForegroundColor Red
Write-Host ""

# Performance Summary Table
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "Test Name                           Response Time   Status" -ForegroundColor White
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

foreach ($result in $results) {
    $name = $result.Name.PadRight(35)
    $time = "$($result.ResponseTime)ms".PadRight(15)
    
    if ($result.Success) {
        Write-Host "$name $time ✓" -ForegroundColor Green
    }
    else {
        Write-Host "$name $time ✗" -ForegroundColor Red
    }
}

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

Write-Host ""

# Calculate average improvement
$coldStarts = @($result1.ResponseTime, $result3.ResponseTime, $result5.ResponseTime)
$cachedRequests = @($result2.ResponseTime, $result4.ResponseTime, $result6.ResponseTime)

$avgColdStart = ($coldStarts | Measure-Object -Average).Average
$avgCached = ($cachedRequests | Measure-Object -Average).Average
$avgImprovement = [math]::Round($avgColdStart / $avgCached, 2)

Write-Host "📈 Performance Statistics:" -ForegroundColor Cyan
Write-Host "   Average Cold Start:    $([math]::Round($avgColdStart, 2))ms" -ForegroundColor White
Write-Host "   Average Cached:        $([math]::Round($avgCached, 2))ms" -ForegroundColor White
Write-Host "   Average Improvement:   ${avgImprovement}x faster" -ForegroundColor Green

Write-Host ""
Write-Host "💡 Pro Tip: Check your terminal console for cache hit/miss logs" -ForegroundColor Yellow
Write-Host "   Look for: ✅ Cache Hit | ❌ Cache Miss | 🗑️ Cache Invalidated" -ForegroundColor Gray

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "  Tests Complete!" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""
