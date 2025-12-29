/**
 * RBAC Test Script
 * Demonstrates and tests role-based access control
 *
 * Run with: npm run test:rbac
 * Or with: npx tsx tests/rbac-test.ts
 */

import {
  Role,
  Permission,
  hasPermission,
  canAccessResource,
  hasHigherPrivilege,
} from "../config/roles.js";

console.log("🔐 RBAC System Test\n");
console.log("=".repeat(60));

// Test 1: Permission Checks
console.log("\n📋 Test 1: Permission Checks");
console.log("-".repeat(60));

const testPermissions = [
  { role: Role.ADMIN, permission: Permission.DELETE_USER, expected: true },
  { role: Role.VENDOR, permission: Permission.DELETE_USER, expected: false },
  {
    role: Role.INSPECTOR,
    permission: Permission.APPROVE_LICENSE,
    expected: true,
  },
  {
    role: Role.VENDOR,
    permission: Permission.APPROVE_LICENSE,
    expected: false,
  },
  { role: Role.VENDOR, permission: Permission.READ_LICENSE, expected: true },
];

testPermissions.forEach(({ role, permission, expected }) => {
  const result = hasPermission(role, permission);
  const status = result === expected ? "✅ PASS" : "❌ FAIL";
  console.log(
    `${status} | ${role.padEnd(10)} | ${permission.padEnd(20)} | Expected: ${expected}, Got: ${result}`
  );
});

// Test 2: Resource Ownership
console.log("\n\n🏠 Test 2: Resource Ownership");
console.log("-".repeat(60));

const ownershipTests = [
  {
    role: Role.ADMIN,
    userId: 1,
    resourceOwnerId: 2,
    expected: true,
    reason: "Admin can access any resource",
  },
  {
    role: Role.INSPECTOR,
    userId: 1,
    resourceOwnerId: 2,
    expected: true,
    reason: "Inspector can access any resource",
  },
  {
    role: Role.VENDOR,
    userId: 1,
    resourceOwnerId: 1,
    expected: true,
    reason: "Vendor can access own resource",
  },
  {
    role: Role.VENDOR,
    userId: 1,
    resourceOwnerId: 2,
    expected: false,
    reason: "Vendor cannot access others resource",
  },
];

ownershipTests.forEach(
  ({ role, userId, resourceOwnerId, expected, reason }) => {
    const result = canAccessResource(role, userId, resourceOwnerId);
    const status = result === expected ? "✅ PASS" : "❌ FAIL";
    console.log(
      `${status} | ${role.padEnd(10)} | User ${userId} -> Resource ${resourceOwnerId}`
    );
    console.log(`       Reason: ${reason}`);
  }
);

// Test 3: Role Hierarchy
console.log("\n\n👑 Test 3: Role Hierarchy");
console.log("-".repeat(60));

const hierarchyTests = [
  { role1: Role.ADMIN, role2: Role.INSPECTOR, expected: true },
  { role1: Role.ADMIN, role2: Role.VENDOR, expected: true },
  { role1: Role.INSPECTOR, role2: Role.VENDOR, expected: true },
  { role1: Role.VENDOR, role2: Role.ADMIN, expected: false },
  { role1: Role.INSPECTOR, role2: Role.ADMIN, expected: false },
];

hierarchyTests.forEach(({ role1, role2, expected }) => {
  const result = hasHigherPrivilege(role1, role2);
  const status = result === expected ? "✅ PASS" : "❌ FAIL";
  console.log(
    `${status} | ${role1} > ${role2} ? ${result} (Expected: ${expected})`
  );
});

// Test 4: Permission Summary
console.log("\n\n📊 Test 4: Permission Summary by Role");
console.log("-".repeat(60));

[Role.ADMIN, Role.INSPECTOR, Role.VENDOR].forEach((role) => {
  const permissions = [
    Permission.CREATE_USER,
    Permission.DELETE_USER,
    Permission.APPROVE_LICENSE,
    Permission.CREATE_INSPECTION,
    Permission.VIEW_ANALYTICS,
  ];

  console.log(`\n${role}:`);
  permissions.forEach((permission) => {
    const has = hasPermission(role, permission);
    const icon = has ? "✅" : "❌";
    console.log(`  ${icon} ${permission}`);
  });
});

// Test Results Summary
console.log("\n\n" + "=".repeat(60));
console.log("✅ All RBAC tests completed!");
console.log("=".repeat(60));

console.log("\n💡 Key Insights:");
console.log("  • ADMIN has full system access");
console.log("  • INSPECTOR can approve licenses and create inspections");
console.log("  • VENDOR can only access their own resources");
console.log("  • Role hierarchy: ADMIN > INSPECTOR > VENDOR");
console.log("  • All access decisions are logged for auditing\n");
