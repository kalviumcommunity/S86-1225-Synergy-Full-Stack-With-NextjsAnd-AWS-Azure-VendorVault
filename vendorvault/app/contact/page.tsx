"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import FormInput from "@/components/FormInput";

/**
 * Contact Form Page
 *
 * Demonstrates a practical contact form using React Hook Form + Zod.
 * Shows how to build a second form with the same validation approach.
 *
 * Key Features:
 * ✅ Textarea support for longer messages
 * ✅ Optional fields using .optional()
 * ✅ Min/Max length validation
 * ✅ Real-time validation feedback
 * ✅ Success message after submission
 */

const contactSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must not exceed 50 characters"),
  email: z.string().email("Please enter a valid email address"),
  subject: z
    .string()
    .min(3, "Subject must be at least 3 characters")
    .max(100, "Subject must not exceed 100 characters"),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(1000, "Message must not exceed 1000 characters"),
  phone: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^\d{10,15}$/.test(val),
      "Phone must be 10-15 digits"
    ),
});

type ContactFormData = z.infer<typeof contactSchema>;

export default function ContactPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    mode: "onChange",
  });

  const onSubmit = async (data: ContactFormData) => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log("✅ Contact Form Submitted:", data);
      alert("Thank you for reaching out! We'll get back to you soon.");
      reset();
    } catch (error) {
      console.error("❌ Submission Error:", error);
      alert("Failed to send message. Please try again.");
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4 py-12">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Contact Us</h1>
          <p className="text-gray-600 text-lg">
            We&apos;d love to hear from you. Send us a message anytime!
          </p>
        </div>

        {/* Form Card */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white p-8 rounded-xl shadow-2xl border border-green-200"
          noValidate
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name Field */}
            <FormInput
              label="Full Name"
              name="name"
              type="text"
              placeholder="Your name"
              register={register("name")}
              error={errors.name}
              required
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
            />
          </div>

          {/* Phone Field (Optional) */}
          <FormInput
            label="Phone Number"
            name="phone"
            type="tel"
            placeholder="1234567890"
            register={register("phone")}
            error={errors.phone}
            helperText="Optional - 10-15 digits"
          />

          {/* Subject Field */}
          <FormInput
            label="Subject"
            name="subject"
            type="text"
            placeholder="What is this about?"
            register={register("subject")}
            error={errors.subject}
            required
          />

          {/* Message Field */}
          <div className="mb-4">
            <label
              htmlFor="message"
              className="block mb-2 font-medium text-gray-700"
            >
              Message <span className="text-red-500 ml-1">*</span>
            </label>
            <textarea
              id="message"
              placeholder="Your message here..."
              aria-invalid={errors.message ? "true" : "false"}
              aria-describedby={errors.message ? "message-error" : undefined}
              {...register("message")}
              rows={6}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 resize-none transition-colors ${
                errors.message
                  ? "border-red-500 focus:ring-red-500 bg-red-50"
                  : "border-gray-300 focus:ring-green-500 bg-white"
              }`}
            />
            {errors.message && (
              <p
                id="message-error"
                className="text-red-500 text-sm mt-1 font-medium"
              >
                {errors.message.message}
              </p>
            )}
            <p className="text-gray-500 text-xs mt-1">
              {register("message").name ? "10-1000 characters" : ""}
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all duration-200 mt-6 ${
              isSubmitting
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700 active:scale-95"
            }`}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Sending...
              </span>
            ) : (
              "Send Message"
            )}
          </button>
        </form>

        {/* Info Box */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-green-800 mb-1">📧 Email</h3>
            <p className="text-sm text-green-700">support@vendorvault.com</p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 mb-1">📞 Phone</h3>
            <p className="text-sm text-blue-700">+1 (800) 123-4567</p>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h3 className="font-semibold text-purple-800 mb-1">🏢 Office</h3>
            <p className="text-sm text-purple-700">New Delhi, India</p>
          </div>
        </div>
      </div>
    </main>
  );
}
