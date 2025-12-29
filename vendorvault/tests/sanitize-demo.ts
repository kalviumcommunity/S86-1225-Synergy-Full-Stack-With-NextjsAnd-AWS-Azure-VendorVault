import { sanitizeInput } from "@/utils/sanitize";

// Example: Before sanitization
const maliciousInput = `<script>alert('XSS')</script>\nRobert'); DROP TABLE users;--`;
console.log("Before sanitization:", maliciousInput);

// After sanitization
const cleanInput = sanitizeInput(maliciousInput);
console.log("After sanitization:", cleanInput);

// Output for README demonstration
export const beforeAfterSanitization = {
  before: maliciousInput,
  after: cleanInput,
};
