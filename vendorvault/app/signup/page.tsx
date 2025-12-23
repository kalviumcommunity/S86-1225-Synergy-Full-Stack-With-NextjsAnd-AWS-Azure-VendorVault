"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import FormInput from "@/components/FormInput";

/**
 * Signup Form Page
 *
 * Demonstrates React Hook Form + Zod integration for user registration.
 *
 * Key Features:
 * ✅ Schema-based validation using Zod
 * ✅ Automatic type inference with z.infer
 * ✅ Reusable FormInput component
 * ✅ Proper error handling and display
 * ✅ Accessible form structure (labels, aria attributes)
 * ✅ Loading state during form submission
 */

// Step 1: Define validation schema with Zod
const signupSchema = z
  .object({
    name: z
      .string()
      .min(3, "Name must be at least 3 characters long")
      .max(100, "Name must not exceed 100 characters"),
    email: z.string().email("Invalid email address"),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters long")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

// Step 2: Derive TypeScript type from schema
type SignupFormData = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    mode: "onBlur", // Validate on blur for better UX
  });

  const onSubmit = async (data: SignupFormData) => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      console.log("✅ Form Submitted Successfully:", data);
      alert(`Welcome, ${data.name}! Your account has been created.`);
      reset();
    } catch (error) {
      console.error("❌ Submission Error:", error);
      alert("An error occurred. Please try again.");
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Create Account
          </h1>
          <p className="text-gray-600">
            Join VendorVault and manage your vendor profile
          </p>
        </div>

        {/* Form Card */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white p-8 rounded-lg shadow-lg border border-gray-200"
          noValidate
        >
          {/* Name Field */}
          <FormInput
            label="Full Name"
            name="name"
            type="text"
            placeholder="John Doe"
            register={register("name")}
            error={errors.name}
            required
            helperText="Please enter your full name"
          />

          {/* Email Field */}
          <FormInput
            label="Email Address"
            name="email"
            type="email"
            placeholder="you@example.com"
            register={register("email")}
            error={errors.email}
            required
            helperText="We'll use this to send you updates"
          />

          {/* Password Field */}
          <FormInput
            label="Password"
            name="password"
            type="password"
            placeholder="••••••••"
            register={register("password")}
            error={errors.password}
            required
            helperText="Min 6 characters, 1 uppercase, 1 number"
          />

          {/* Confirm Password Field */}
          <FormInput
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            placeholder="••••••••"
            register={register("confirmPassword")}
            error={errors.confirmPassword}
            required
          />

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all duration-200 mt-6 ${
              isSubmitting
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 active:scale-95"
            }`}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Creating Account...
              </span>
            ) : (
              "Create Account"
            )}
          </button>

          {/* Footer */}
          <p className="text-center text-gray-600 text-sm mt-4">
            Already have an account?{" "}
            <a
              href="/auth/login"
              className="text-blue-600 hover:underline font-medium"
            >
              Sign In
            </a>
          </p>
        </form>

        {/* Info Box */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Test Data:</strong> Your password needs at least one
            uppercase letter and one number for security.
          </p>
        </div>
      </div>
    </main>
  );
}
