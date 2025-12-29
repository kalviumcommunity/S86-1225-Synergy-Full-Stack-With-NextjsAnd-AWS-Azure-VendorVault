import sanitizeHtml from "sanitize-html";

/**
 * Sanitizes user input to prevent XSS attacks.
 * Removes all HTML tags and attributes by default.
 * @param input - The user-provided string to sanitize
 * @returns The sanitized string
 */
export const sanitizeInput = (input: string): string => {
  return sanitizeHtml(input, {
    allowedTags: [],
    allowedAttributes: {},
  });
};

/**
 * Recursively sanitize all string properties in an object or array.
 * Useful for sanitizing request bodies or query params.
 * @param obj - The object or array to sanitize
 * @returns The sanitized object/array
 */
export function sanitizeObject<T>(obj: T): T {
  if (typeof obj === "string") return sanitizeInput(obj) as T;
  if (Array.isArray(obj)) return obj.map(sanitizeObject) as T;
  if (obj && typeof obj === "object") {
    const sanitized: Record<string, unknown> = {};
    for (const key in obj as Record<string, unknown>) {
      sanitized[key] = sanitizeObject((obj as Record<string, unknown>)[key]);
    }
    return sanitized as T;
  }
  return obj;
}
