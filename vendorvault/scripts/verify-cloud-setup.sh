#!/bin/bash

# VendorVault Database Setup Verification Script
# This script verifies your cloud database configuration

set -e

echo "╔═══════════════════════════════════════════════════════╗"
echo "║  VendorVault Cloud Database Setup Verification       ║"
echo "╚═══════════════════════════════════════════════════════╝"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track results
TESTS_PASSED=0
TESTS_FAILED=0

# Function to check if a command exists
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

# Function to print test result
print_result() {
  if [ $1 -eq 0 ]; then
    echo -e "${GREEN}✓${NC} $2"
    ((TESTS_PASSED++))
  else
    echo -e "${RED}✗${NC} $2"
    ((TESTS_FAILED++))
  fi
}

echo "1️⃣  Checking Prerequisites..."
echo "─────────────────────────────────────────────────────"

# Check Node.js
if command_exists node; then
  NODE_VERSION=$(node --version)
  print_result 0 "Node.js installed: $NODE_VERSION"
else
  print_result 1 "Node.js not found"
fi

# Check npm
if command_exists npm; then
  NPM_VERSION=$(npm --version)
  print_result 0 "npm installed: $NPM_VERSION"
else
  print_result 1 "npm not found"
fi

# Check psql
if command_exists psql; then
  PSQL_VERSION=$(psql --version | awk '{print $3}')
  print_result 0 "PostgreSQL client installed: $PSQL_VERSION"
else
  print_result 1 "psql not found (optional but recommended)"
fi

echo ""
echo "2️⃣  Checking Environment Configuration..."
echo "─────────────────────────────────────────────────────"

# Check .env file
if [ -f .env ]; then
  print_result 0 ".env file exists"
  
  # Check DATABASE_URL
  if grep -q "DATABASE_URL=" .env; then
    print_result 0 "DATABASE_URL is configured"
    
    # Check if it's pointing to cloud (contains amazonaws or azure)
    if grep "DATABASE_URL=" .env | grep -qE "amazonaws|azure|postgres\.database"; then
      print_result 0 "DATABASE_URL points to cloud provider"
    else
      print_result 1 "DATABASE_URL appears to be localhost (not cloud)"
    fi
    
    # Check SSL mode
    if grep "DATABASE_URL=" .env | grep -q "sslmode=require"; then
      print_result 0 "SSL mode is enabled (sslmode=require)"
    else
      print_result 1 "SSL mode not configured (add ?sslmode=require)"
    fi
  else
    print_result 1 "DATABASE_URL not found in .env"
  fi
  
  # Check other required variables
  grep -q "NEXTAUTH_SECRET=" .env && print_result 0 "NEXTAUTH_SECRET configured" || print_result 1 "NEXTAUTH_SECRET missing"
  grep -q "JWT_SECRET=" .env && print_result 0 "JWT_SECRET configured" || print_result 1 "JWT_SECRET missing"
  grep -q "REDIS_URL=" .env && print_result 0 "REDIS_URL configured" || print_result 1 "REDIS_URL missing"
  
else
  print_result 1 ".env file not found"
  echo -e "${YELLOW}⚠${NC}  Create .env file from .env.example"
fi

echo ""
echo "3️⃣  Checking Prisma Configuration..."
echo "─────────────────────────────────────────────────────"

# Check Prisma schema
if [ -f prisma/schema.prisma ]; then
  print_result 0 "Prisma schema exists"
  
  # Check if Prisma client is generated
  if [ -d node_modules/.prisma/client ]; then
    print_result 0 "Prisma client generated"
  else
    print_result 1 "Prisma client not generated (run: npx prisma generate)"
  fi
else
  print_result 1 "Prisma schema not found"
fi

# Check migrations
if [ -d prisma/migrations ]; then
  MIGRATION_COUNT=$(ls -1 prisma/migrations | wc -l)
  print_result 0 "Migrations directory exists ($MIGRATION_COUNT migrations)"
else
  print_result 1 "No migrations found"
fi

echo ""
echo "4️⃣  Testing Database Connection..."
echo "─────────────────────────────────────────────────────"

# Try to run database test
if [ -f scripts/test-db-connection.ts ]; then
  print_result 0 "Database test script exists"
  
  echo -e "${YELLOW}Running connection test...${NC}"
  if npm run test:db > /tmp/db-test.log 2>&1; then
    print_result 0 "Database connection successful"
    echo -e "${GREEN}   See output in /tmp/db-test.log${NC}"
  else
    print_result 1 "Database connection failed"
    echo -e "${RED}   Check /tmp/db-test.log for details${NC}"
  fi
else
  print_result 1 "Database test script not found"
fi

echo ""
echo "5️⃣  Checking Cloud Provider Configuration..."
echo "─────────────────────────────────────────────────────"

# Check AWS configuration
if [ -f .env ] && grep -q "amazonaws" .env; then
  echo -e "${YELLOW}Detected AWS RDS configuration${NC}"
  grep -q "AWS_REGION=" .env && print_result 0 "AWS_REGION configured" || print_result 1 "AWS_REGION missing"
  grep -q "AWS_ACCESS_KEY_ID=" .env && print_result 0 "AWS_ACCESS_KEY_ID configured" || print_result 1 "AWS_ACCESS_KEY_ID missing"
  grep -q "AWS_S3_BUCKET_NAME=" .env && print_result 0 "AWS_S3_BUCKET_NAME configured" || print_result 1 "AWS_S3_BUCKET_NAME missing"
fi

# Check Azure configuration
if [ -f .env ] && grep -q "azure" .env; then
  echo -e "${YELLOW}Detected Azure PostgreSQL configuration${NC}"
  grep -q "AZURE_STORAGE_CONNECTION_STRING=" .env && print_result 0 "Azure Storage configured" || print_result 1 "Azure Storage not configured"
fi

echo ""
echo "6️⃣  Checking Documentation..."
echo "─────────────────────────────────────────────────────"

[ -f docs/CLOUD_DATABASE_SETUP.md ] && print_result 0 "Cloud database setup guide exists" || print_result 1 "Setup guide missing"
[ -f docs/BACKUP_SECURITY_STRATEGY.md ] && print_result 0 "Backup & security strategy documented" || print_result 1 "Strategy document missing"
[ -f README.md ] && print_result 0 "README.md exists" || print_result 1 "README.md missing"

echo ""
echo "╔═══════════════════════════════════════════════════════╗"
echo "║                    Test Summary                       ║"
echo "╚═══════════════════════════════════════════════════════╝"
echo ""
echo -e "Tests Passed:  ${GREEN}${TESTS_PASSED}${NC}"
echo -e "Tests Failed:  ${RED}${TESTS_FAILED}${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
  echo -e "${GREEN}╔════════════════════════════════════════════════════╗${NC}"
  echo -e "${GREEN}║  ✓ All checks passed! Your setup looks good.      ║${NC}"
  echo -e "${GREEN}╚════════════════════════════════════════════════════╝${NC}"
  echo ""
  echo "Next steps:"
  echo "  1. Deploy your application to cloud"
  echo "  2. Set up monitoring and alerts"
  echo "  3. Configure automated backups"
  echo "  4. Review security documentation"
  exit 0
else
  echo -e "${YELLOW}╔════════════════════════════════════════════════════╗${NC}"
  echo -e "${YELLOW}║  ⚠ Some checks failed. Please review above.       ║${NC}"
  echo -e "${YELLOW}╚════════════════════════════════════════════════════╝${NC}"
  echo ""
  echo "Common fixes:"
  echo "  • Create .env file: cp .env.example .env"
  echo "  • Generate Prisma client: npx prisma generate"
  echo "  • Run migrations: npx prisma migrate deploy"
  echo "  • Check database connection string format"
  echo "  • Ensure cloud database is accessible (firewall rules)"
  echo ""
  echo "📖 See docs/CLOUD_DATABASE_SETUP.md for detailed setup guide"
  exit 1
fi
