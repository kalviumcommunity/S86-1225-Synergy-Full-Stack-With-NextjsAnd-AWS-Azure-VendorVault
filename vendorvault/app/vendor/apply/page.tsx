"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useUI } from "@/hooks/useUI";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function VendorApply() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { showSuccess, showError, isDarkMode, startLoading, stopLoading } =
    useUI();

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Personal Information
    fullName: user?.username || "",
    email: user?.email || "",
    phone: "",
    alternatePhone: "",
    dateOfBirth: "",
    gender: "",
    aadharNumber: "",

    // Business Information
    businessName: "",
    businessType: "",
    businessAddress: "",
    city: "",
    state: "",
    pincode: "",
    gstNumber: "",
    panNumber: "",
    yearsInBusiness: "",

    // Railway Station Information
    preferredStation: "",
    stationType: "",
    shopNumber: "",
    platformNumber: "",
    shopArea: "",

    // Product/Service Information
    productCategory: "",
    productDescription: "",
    estimatedDailySales: "",
    operatingHours: "",

    // Documents (file uploads)
    aadharDocument: null as File | null,
    panDocument: null as File | null,
    gstDocument: null as File | null,
    businessProofDocument: null as File | null,
    photoDocument: null as File | null,
    shopPhotos: null as File | null,

    // Bank Information
    bankName: "",
    accountNumber: "",
    ifscCode: "",
    accountHolderName: "",
    branchName: "",

    // Declaration
    agreeToTerms: false,
    declarationAccurate: false,
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    fieldName: string
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showError("File size should not exceed 5MB");
        return;
      }
      setFormData({ ...formData, [fieldName]: file });
    }
  };

  const validateStep = (step: number) => {
    switch (step) {
      case 1:
        if (
          !formData.fullName ||
          !formData.email ||
          !formData.phone ||
          !formData.dateOfBirth ||
          !formData.aadharNumber
        ) {
          showError("Please fill in all required personal information");
          return false;
        }
        if (formData.phone.length < 10) {
          showError("Please enter a valid phone number");
          return false;
        }
        if (formData.aadharNumber.length !== 12) {
          showError("Aadhar number must be 12 digits");
          return false;
        }
        break;
      case 2:
        if (
          !formData.businessName ||
          !formData.businessType ||
          !formData.businessAddress ||
          !formData.city ||
          !formData.state ||
          !formData.pincode
        ) {
          showError("Please fill in all required business information");
          return false;
        }
        if (formData.pincode.length !== 6) {
          showError("Please enter a valid 6-digit pincode");
          return false;
        }
        break;
      case 3:
        if (
          !formData.preferredStation ||
          !formData.stationType ||
          !formData.productCategory ||
          !formData.productDescription
        ) {
          showError(
            "Please fill in all required station and product information"
          );
          return false;
        }
        break;
      case 4:
        if (
          !formData.aadharDocument ||
          !formData.panDocument ||
          !formData.photoDocument
        ) {
          showError(
            "Please upload all required documents (Aadhar, PAN, and Photo)"
          );
          return false;
        }
        break;
      case 5:
        if (
          !formData.bankName ||
          !formData.accountNumber ||
          !formData.ifscCode ||
          !formData.accountHolderName
        ) {
          showError("Please fill in all bank information");
          return false;
        }
        if (!formData.agreeToTerms || !formData.declarationAccurate) {
          showError("Please accept all declarations to proceed");
          return false;
        }
        break;
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateStep(currentStep)) {
      return;
    }

    startLoading();

    try {
      const documentUrls: Record<string, string> = {};

      for (const [key, value] of Object.entries(formData)) {
        if (value instanceof File) {
          const reader = new FileReader();
          const base64 = await new Promise((resolve) => {
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(value);
          });

          const uploadResponse = await fetch("/api/vendor/upload", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              filename: value.name,
              fileType: value.type,
              base64Data: base64,
              vendorId: user?.id,
              documentType: key.replace("Document", "").replace("Photos", ""),
            }),
          });

          if (uploadResponse.ok) {
            const uploadData = await uploadResponse.json();
            if (uploadData.success) {
              documentUrls[
                key.replace("Document", "Url").replace("Photos", "Urls")
              ] = uploadData.fileUrl;
            }
          }
        }
      }

      const applicationData = {
        ...formData,
        ...documentUrls,
        userId: user?.id,
      };

      Object.keys(applicationData).forEach((key) => {
        if (applicationData[key] instanceof File) {
          delete applicationData[key];
        }
      });

      const response = await fetch("/api/vendor/apply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("vendorvault_token")}`,
        },
        body: JSON.stringify(applicationData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        showError(errorText || "Application submission failed");
        return;
      }

      const data = await response.json();

      if (data.success) {
        showSuccess(
          "Application submitted successfully! Redirecting to dashboard..."
        );
        setTimeout(() => {
          router.push("/vendor/dashboard");
        }, 2000);
      } else {
        showError(data.message || "Failed to submit application");
      }
    } catch (error) {
      console.error("Application submission error:", error);
      showError("An error occurred while submitting your application");
    } finally {
      stopLoading();
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-8 text-center max-w-md">
          <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
          <p className="mb-6">Please log in to submit a vendor application</p>
          <Button onClick={() => router.push("/auth/login")}>
            Go to Login
          </Button>
        </Card>
      </div>
    );
  }

  const steps = [
    { number: 1, title: "Personal Info", icon: "👤" },
    { number: 2, title: "Business Details", icon: "🏪" },
    { number: 3, title: "Station & Products", icon: "🚉" },
    { number: 4, title: "Documents", icon: "📄" },
    { number: 5, title: "Bank & Review", icon: "🏦" },
  ];

  return (
    <div
      className={`min-h-screen py-8 px-4 ${isDarkMode ? "bg-gray-900" : "bg-gray-50"}`}
    >
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1
            className={`text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent`}
          >
            Railway Vendor License Application
          </h1>
          <p
            className={`text-lg ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
          >
            Complete all steps to submit your application for review
          </p>
        </div>

        {/* Progress Steps */}
        <div
          className={`mb-8 p-6 rounded-xl ${isDarkMode ? "bg-gray-800" : "bg-white"} shadow-lg`}
        >
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-lg transition-all ${
                      currentStep > step.number
                        ? "bg-green-500 text-white shadow-lg shadow-green-500/50"
                        : currentStep === step.number
                          ? "bg-blue-600 text-white shadow-lg shadow-blue-500/50 scale-110"
                          : isDarkMode
                            ? "bg-gray-700 text-gray-400"
                            : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {currentStep > step.number ? "✓" : step.icon}
                  </div>
                  <p
                    className={`text-xs mt-2 text-center font-medium ${
                      currentStep >= step.number
                        ? isDarkMode
                          ? "text-white"
                          : "text-gray-900"
                        : isDarkMode
                          ? "text-gray-500"
                          : "text-gray-400"
                    }`}
                  >
                    {step.title}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`h-1 flex-1 mx-2 transition-all ${
                      currentStep > step.number
                        ? "bg-green-500"
                        : isDarkMode
                          ? "bg-gray-700"
                          : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Card */}
        <form onSubmit={handleSubmit}>
          <Card className="p-8 mb-6">
            {/* Step 1: Personal Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-2xl">
                    👤
                  </div>
                  <div>
                    <h2
                      className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}
                    >
                      Personal Information
                    </h2>
                    <p
                      className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                    >
                      Please provide accurate personal details
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}
                    >
                      Full Name (as per Aadhar){" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="John Doe"
                      className={`w-full px-4 py-3 rounded-lg border ${isDarkMode ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" : "bg-white border-gray-300"} focus:ring-2 focus:ring-blue-500 focus:border-transparent transition`}
                      required
                    />
                  </div>

                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}
                    >
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="vendor@example.com"
                      className={`w-full px-4 py-3 rounded-lg border ${isDarkMode ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" : "bg-white border-gray-300"} focus:ring-2 focus:ring-blue-500 focus:border-transparent transition`}
                      required
                    />
                  </div>

                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}
                    >
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="9876543210"
                      maxLength={10}
                      className={`w-full px-4 py-3 rounded-lg border ${isDarkMode ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" : "bg-white border-gray-300"} focus:ring-2 focus:ring-blue-500 focus:border-transparent transition`}
                      required
                    />
                  </div>

                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}
                    >
                      Alternate Phone
                    </label>
                    <input
                      type="tel"
                      name="alternatePhone"
                      value={formData.alternatePhone}
                      onChange={handleChange}
                      placeholder="9876543211"
                      maxLength={10}
                      className={`w-full px-4 py-3 rounded-lg border ${isDarkMode ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" : "bg-white border-gray-300"} focus:ring-2 focus:ring-blue-500 focus:border-transparent transition`}
                    />
                  </div>

                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}
                    >
                      Date of Birth <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                      max={
                        new Date(
                          new Date().setFullYear(new Date().getFullYear() - 18)
                        )
                          .toISOString()
                          .split("T")[0]
                      }
                      className={`w-full px-4 py-3 rounded-lg border ${isDarkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"} focus:ring-2 focus:ring-blue-500 focus:border-transparent transition`}
                      required
                    />
                    <p
                      className={`text-xs mt-1 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
                    >
                      Must be at least 18 years old
                    </p>
                  </div>

                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}
                    >
                      Gender <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 rounded-lg border ${isDarkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"} focus:ring-2 focus:ring-blue-500 focus:border-transparent transition`}
                      required
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label
                      className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}
                    >
                      Aadhar Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="aadharNumber"
                      value={formData.aadharNumber}
                      onChange={handleChange}
                      placeholder="123456789012"
                      maxLength={12}
                      pattern="[0-9]{12}"
                      className={`w-full px-4 py-3 rounded-lg border ${isDarkMode ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" : "bg-white border-gray-300"} focus:ring-2 focus:ring-blue-500 focus:border-transparent transition`}
                      required
                    />
                    <p
                      className={`text-xs mt-1 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
                    >
                      12-digit Aadhar number (without spaces)
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Business Information */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-2xl">
                    🏪
                  </div>
                  <div>
                    <h2
                      className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}
                    >
                      Business Details
                    </h2>
                    <p
                      className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                    >
                      Provide complete information about your business
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label
                      className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}
                    >
                      Business/Shop Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="businessName"
                      value={formData.businessName}
                      onChange={handleChange}
                      placeholder="ABC Trading Company"
                      className={`w-full px-4 py-3 rounded-lg border ${isDarkMode ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" : "bg-white border-gray-300"} focus:ring-2 focus:ring-blue-500 focus:border-transparent transition`}
                      required
                    />
                  </div>

                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}
                    >
                      Business Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="businessType"
                      value={formData.businessType}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 rounded-lg border ${isDarkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"} focus:ring-2 focus:ring-blue-500 focus:border-transparent transition`}
                      required
                    >
                      <option value="">Select Type</option>
                      <option value="proprietary">
                        Proprietary (Sole Ownership)
                      </option>
                      <option value="partnership">Partnership</option>
                      <option value="pvt_ltd">Private Limited</option>
                      <option value="ltd">Limited Company</option>
                      <option value="llp">
                        LLP (Limited Liability Partnership)
                      </option>
                    </select>
                  </div>

                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}
                    >
                      Years in Business
                    </label>
                    <input
                      type="number"
                      name="yearsInBusiness"
                      value={formData.yearsInBusiness}
                      onChange={handleChange}
                      placeholder="5"
                      min="0"
                      max="100"
                      className={`w-full px-4 py-3 rounded-lg border ${isDarkMode ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" : "bg-white border-gray-300"} focus:ring-2 focus:ring-blue-500 focus:border-transparent transition`}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label
                      className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}
                    >
                      Business Address <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="businessAddress"
                      value={formData.businessAddress}
                      onChange={handleChange}
                      rows={3}
                      placeholder="Complete address including building/area name"
                      className={`w-full px-4 py-3 rounded-lg border ${isDarkMode ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" : "bg-white border-gray-300"} focus:ring-2 focus:ring-blue-500 focus:border-transparent transition`}
                      required
                    />
                  </div>

                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}
                    >
                      City <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="Mumbai"
                      className={`w-full px-4 py-3 rounded-lg border ${isDarkMode ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" : "bg-white border-gray-300"} focus:ring-2 focus:ring-blue-500 focus:border-transparent transition`}
                      required
                    />
                  </div>

                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}
                    >
                      State <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      placeholder="Maharashtra"
                      className={`w-full px-4 py-3 rounded-lg border ${isDarkMode ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" : "bg-white border-gray-300"} focus:ring-2 focus:ring-blue-500 focus:border-transparent transition`}
                      required
                    />
                  </div>

                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}
                    >
                      Pincode <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleChange}
                      pattern="[0-9]{6}"
                      placeholder="400001"
                      maxLength={6}
                      className={`w-full px-4 py-3 rounded-lg border ${isDarkMode ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" : "bg-white border-gray-300"} focus:ring-2 focus:ring-blue-500 focus:border-transparent transition`}
                      required
                    />
                  </div>

                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}
                    >
                      GST Number (if applicable)
                    </label>
                    <input
                      type="text"
                      name="gstNumber"
                      value={formData.gstNumber}
                      onChange={handleChange}
                      placeholder="22AAAAA0000A1Z5"
                      maxLength={15}
                      className={`w-full px-4 py-3 rounded-lg border ${isDarkMode ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" : "bg-white border-gray-300"} focus:ring-2 focus:ring-blue-500 focus:border-transparent transition`}
                    />
                    <p
                      className={`text-xs mt-1 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
                    >
                      Optional for small businesses
                    </p>
                  </div>

                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}
                    >
                      PAN Number
                    </label>
                    <input
                      type="text"
                      name="panNumber"
                      value={formData.panNumber}
                      onChange={handleChange}
                      placeholder="ABCDE1234F"
                      maxLength={10}
                      pattern="[A-Z]{5}[0-9]{4}[A-Z]{1}"
                      className={`w-full px-4 py-3 rounded-lg border ${isDarkMode ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" : "bg-white border-gray-300"} focus:ring-2 focus:ring-blue-500 focus:border-transparent transition`}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Station & Product Information */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-2xl">
                    🚉
                  </div>
                  <div>
                    <h2
                      className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}
                    >
                      Station & Product Information
                    </h2>
                    <p
                      className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                    >
                      Specify your preferred location and what you plan to sell
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label
                      className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}
                    >
                      Preferred Railway Station{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="preferredStation"
                      value={formData.preferredStation}
                      onChange={handleChange}
                      placeholder="Mumbai Central Station"
                      className={`w-full px-4 py-3 rounded-lg border ${isDarkMode ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" : "bg-white border-gray-300"} focus:ring-2 focus:ring-blue-500 focus:border-transparent transition`}
                      required
                    />
                  </div>

                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}
                    >
                      Station Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="stationType"
                      value={formData.stationType}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 rounded-lg border ${isDarkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"} focus:ring-2 focus:ring-blue-500 focus:border-transparent transition`}
                      required
                    >
                      <option value="">Select Type</option>
                      <option value="junction">Junction Station</option>
                      <option value="terminal">Terminal Station</option>
                      <option value="halt">Halt Station</option>
                      <option value="suburban">Suburban Station</option>
                    </select>
                  </div>

                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}
                    >
                      Shop/Stall Number (if existing)
                    </label>
                    <input
                      type="text"
                      name="shopNumber"
                      value={formData.shopNumber}
                      onChange={handleChange}
                      placeholder="S-42"
                      className={`w-full px-4 py-3 rounded-lg border ${isDarkMode ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" : "bg-white border-gray-300"} focus:ring-2 focus:ring-blue-500 focus:border-transparent transition`}
                    />
                  </div>

                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}
                    >
                      Platform Number
                    </label>
                    <input
                      type="text"
                      name="platformNumber"
                      value={formData.platformNumber}
                      onChange={handleChange}
                      placeholder="Platform 3"
                      className={`w-full px-4 py-3 rounded-lg border ${isDarkMode ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" : "bg-white border-gray-300"} focus:ring-2 focus:ring-blue-500 focus:border-transparent transition`}
                    />
                  </div>

                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}
                    >
                      Shop Area (sq ft)
                    </label>
                    <input
                      type="number"
                      name="shopArea"
                      value={formData.shopArea}
                      onChange={handleChange}
                      placeholder="100"
                      min="10"
                      className={`w-full px-4 py-3 rounded-lg border ${isDarkMode ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" : "bg-white border-gray-300"} focus:ring-2 focus:ring-blue-500 focus:border-transparent transition`}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label
                      className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}
                    >
                      Product/Service Category{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="productCategory"
                      value={formData.productCategory}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 rounded-lg border ${isDarkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"} focus:ring-2 focus:ring-blue-500 focus:border-transparent transition`}
                      required
                    >
                      <option value="">Select Category</option>
                      <option value="food_beverages">Food & Beverages</option>
                      <option value="books_magazines">Books & Magazines</option>
                      <option value="snacks_packaged">
                        Snacks & Packaged Items
                      </option>
                      <option value="tea_coffee">Tea & Coffee Stall</option>
                      <option value="general_store">General Store</option>
                      <option value="handicrafts">Handicrafts</option>
                      <option value="electronics">
                        Electronics & Accessories
                      </option>
                      <option value="others">Others</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label
                      className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}
                    >
                      Product Description{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="productDescription"
                      value={formData.productDescription}
                      onChange={handleChange}
                      rows={4}
                      placeholder="Describe the products/services you plan to offer in detail..."
                      className={`w-full px-4 py-3 rounded-lg border ${isDarkMode ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" : "bg-white border-gray-300"} focus:ring-2 focus:ring-blue-500 focus:border-transparent transition`}
                      required
                    />
                  </div>

                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}
                    >
                      Estimated Daily Sales (₹)
                    </label>
                    <input
                      type="number"
                      name="estimatedDailySales"
                      value={formData.estimatedDailySales}
                      onChange={handleChange}
                      placeholder="5000"
                      min="0"
                      className={`w-full px-4 py-3 rounded-lg border ${isDarkMode ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" : "bg-white border-gray-300"} focus:ring-2 focus:ring-blue-500 focus:border-transparent transition`}
                    />
                  </div>

                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}
                    >
                      Operating Hours
                    </label>
                    <input
                      type="text"
                      name="operatingHours"
                      value={formData.operatingHours}
                      onChange={handleChange}
                      placeholder="6 AM - 10 PM"
                      className={`w-full px-4 py-3 rounded-lg border ${isDarkMode ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" : "bg-white border-gray-300"} focus:ring-2 focus:ring-blue-500 focus:border-transparent transition`}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Documents Upload */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-2xl">
                    📄
                  </div>
                  <div>
                    <h2
                      className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}
                    >
                      Document Upload
                    </h2>
                    <p
                      className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                    >
                      Upload clear scanned copies (Max 5MB per file)
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div
                    className={`p-4 rounded-lg border-2 border-dashed ${formData.aadharDocument ? "border-green-500 bg-green-50 dark:bg-green-900/20" : isDarkMode ? "border-gray-600" : "border-gray-300"}`}
                  >
                    <label
                      className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}
                    >
                      Aadhar Card <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => handleFileChange(e, "aadharDocument")}
                      className="w-full text-sm"
                      required
                    />
                    {formData.aadharDocument && (
                      <p className="text-sm text-green-600 mt-2">
                        ✓ {formData.aadharDocument.name}
                      </p>
                    )}
                  </div>

                  <div
                    className={`p-4 rounded-lg border-2 border-dashed ${formData.panDocument ? "border-green-500 bg-green-50 dark:bg-green-900/20" : isDarkMode ? "border-gray-600" : "border-gray-300"}`}
                  >
                    <label
                      className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}
                    >
                      PAN Card <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => handleFileChange(e, "panDocument")}
                      className="w-full text-sm"
                      required
                    />
                    {formData.panDocument && (
                      <p className="text-sm text-green-600 mt-2">
                        ✓ {formData.panDocument.name}
                      </p>
                    )}
                  </div>

                  <div
                    className={`p-4 rounded-lg border-2 border-dashed ${formData.gstDocument ? "border-green-500 bg-green-50 dark:bg-green-900/20" : isDarkMode ? "border-gray-600" : "border-gray-300"}`}
                  >
                    <label
                      className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}
                    >
                      GST Certificate (Optional)
                    </label>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => handleFileChange(e, "gstDocument")}
                      className="w-full text-sm"
                    />
                    {formData.gstDocument && (
                      <p className="text-sm text-green-600 mt-2">
                        ✓ {formData.gstDocument.name}
                      </p>
                    )}
                  </div>

                  <div
                    className={`p-4 rounded-lg border-2 border-dashed ${formData.businessProofDocument ? "border-green-500 bg-green-50 dark:bg-green-900/20" : isDarkMode ? "border-gray-600" : "border-gray-300"}`}
                  >
                    <label
                      className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}
                    >
                      Business Proof (Optional)
                    </label>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) =>
                        handleFileChange(e, "businessProofDocument")
                      }
                      className="w-full text-sm"
                    />
                    <p
                      className={`text-xs mt-1 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
                    >
                      License, Registration, or Trade Certificate
                    </p>
                    {formData.businessProofDocument && (
                      <p className="text-sm text-green-600 mt-2">
                        ✓ {formData.businessProofDocument.name}
                      </p>
                    )}
                  </div>

                  <div
                    className={`p-4 rounded-lg border-2 border-dashed ${formData.photoDocument ? "border-green-500 bg-green-50 dark:bg-green-900/20" : isDarkMode ? "border-gray-600" : "border-gray-300"}`}
                  >
                    <label
                      className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}
                    >
                      Passport Size Photo{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, "photoDocument")}
                      className="w-full text-sm"
                      required
                    />
                    {formData.photoDocument && (
                      <p className="text-sm text-green-600 mt-2">
                        ✓ {formData.photoDocument.name}
                      </p>
                    )}
                  </div>

                  <div
                    className={`p-4 rounded-lg border-2 border-dashed ${formData.shopPhotos ? "border-green-500 bg-green-50 dark:bg-green-900/20" : isDarkMode ? "border-gray-600" : "border-gray-300"}`}
                  >
                    <label
                      className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}
                    >
                      Shop/Location Photos (Optional)
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, "shopPhotos")}
                      className="w-full text-sm"
                    />
                    <p
                      className={`text-xs mt-1 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
                    >
                      Current shop or proposed location
                    </p>
                    {formData.shopPhotos && (
                      <p className="text-sm text-green-600 mt-2">
                        ✓ {formData.shopPhotos.name}
                      </p>
                    )}
                  </div>
                </div>

                <div
                  className={`p-4 rounded-lg ${isDarkMode ? "bg-blue-900/20" : "bg-blue-50"} border ${isDarkMode ? "border-blue-800" : "border-blue-200"}`}
                >
                  <p
                    className={`text-sm ${isDarkMode ? "text-blue-300" : "text-blue-700"}`}
                  >
                    <strong>Note:</strong> Ensure all documents are clear and
                    readable. Supported formats: JPG, PNG, PDF (Max 5MB each)
                  </p>
                </div>
              </div>
            )}

            {/* Step 5: Bank Details & Review */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-2xl">
                    🏦
                  </div>
                  <div>
                    <h2
                      className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}
                    >
                      Bank Details & Final Review
                    </h2>
                    <p
                      className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                    >
                      Provide bank details for license fee payments
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label
                      className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}
                    >
                      Bank Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="bankName"
                      value={formData.bankName}
                      onChange={handleChange}
                      placeholder="State Bank of India"
                      className={`w-full px-4 py-3 rounded-lg border ${isDarkMode ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" : "bg-white border-gray-300"} focus:ring-2 focus:ring-blue-500 focus:border-transparent transition`}
                      required
                    />
                  </div>

                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}
                    >
                      Account Holder Name{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="accountHolderName"
                      value={formData.accountHolderName}
                      onChange={handleChange}
                      placeholder="John Doe"
                      className={`w-full px-4 py-3 rounded-lg border ${isDarkMode ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" : "bg-white border-gray-300"} focus:ring-2 focus:ring-blue-500 focus:border-transparent transition`}
                      required
                    />
                  </div>

                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}
                    >
                      Account Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="accountNumber"
                      value={formData.accountNumber}
                      onChange={handleChange}
                      placeholder="1234567890123"
                      className={`w-full px-4 py-3 rounded-lg border ${isDarkMode ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" : "bg-white border-gray-300"} focus:ring-2 focus:ring-blue-500 focus:border-transparent transition`}
                      required
                    />
                  </div>

                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}
                    >
                      IFSC Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="ifscCode"
                      value={formData.ifscCode}
                      onChange={handleChange}
                      placeholder="SBIN0001234"
                      maxLength={11}
                      className={`w-full px-4 py-3 rounded-lg border ${isDarkMode ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" : "bg-white border-gray-300"} focus:ring-2 focus:ring-blue-500 focus:border-transparent transition`}
                      required
                    />
                  </div>

                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}
                    >
                      Branch Name
                    </label>
                    <input
                      type="text"
                      name="branchName"
                      value={formData.branchName}
                      onChange={handleChange}
                      placeholder="Mumbai Central"
                      className={`w-full px-4 py-3 rounded-lg border ${isDarkMode ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" : "bg-white border-gray-300"} focus:ring-2 focus:ring-blue-500 focus:border-transparent transition`}
                    />
                  </div>
                </div>

                {/* Application Summary */}
                <div
                  className={`mt-8 p-6 rounded-lg ${isDarkMode ? "bg-gray-800 border border-gray-700" : "bg-gray-50 border border-gray-200"}`}
                >
                  <h3
                    className={`text-xl font-bold mb-4 ${isDarkMode ? "text-white" : "text-gray-900"}`}
                  >
                    Application Summary
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p
                        className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                      >
                        Full Name
                      </p>
                      <p
                        className={`font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}
                      >
                        {formData.fullName}
                      </p>
                    </div>
                    <div>
                      <p
                        className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                      >
                        Business Name
                      </p>
                      <p
                        className={`font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}
                      >
                        {formData.businessName || "Not provided"}
                      </p>
                    </div>
                    <div>
                      <p
                        className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                      >
                        Preferred Station
                      </p>
                      <p
                        className={`font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}
                      >
                        {formData.preferredStation || "Not provided"}
                      </p>
                    </div>
                    <div>
                      <p
                        className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                      >
                        Product Category
                      </p>
                      <p
                        className={`font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}
                      >
                        {formData.productCategory || "Not provided"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Declarations */}
                <div className="space-y-4 mt-6">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      name="agreeToTerms"
                      checked={formData.agreeToTerms}
                      onChange={handleChange}
                      className="mt-1 w-5 h-5 rounded"
                      required
                    />
                    <label
                      className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
                    >
                      I agree to the{" "}
                      <span className="text-blue-600 cursor-pointer hover:underline">
                        Terms and Conditions
                      </span>{" "}
                      and
                      <span className="text-blue-600 cursor-pointer hover:underline">
                        {" "}
                        Privacy Policy
                      </span>{" "}
                      of VendorVault. <span className="text-red-500">*</span>
                    </label>
                  </div>

                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      name="declarationAccurate"
                      checked={formData.declarationAccurate}
                      onChange={handleChange}
                      className="mt-1 w-5 h-5 rounded"
                      required
                    />
                    <label
                      className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
                    >
                      I hereby declare that all the information provided above
                      is accurate and complete to the best of my knowledge. I
                      understand that providing false information may result in
                      rejection of my application.{" "}
                      <span className="text-red-500">*</span>
                    </label>
                  </div>
                </div>

                <div
                  className={`p-4 rounded-lg ${isDarkMode ? "bg-yellow-900/20 border-yellow-800" : "bg-yellow-50 border-yellow-200"} border`}
                >
                  <p
                    className={`text-sm ${isDarkMode ? "text-yellow-300" : "text-yellow-800"}`}
                  >
                    <strong>Important:</strong> After submission, your
                    application will be reviewed by the admin team. You will
                    receive email notifications regarding the status of your
                    application.
                  </p>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div
              className={`flex justify-between mt-8 pt-6 border-t ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}
            >
              {currentStep > 1 && (
                <Button
                  type="button"
                  onClick={prevStep}
                  variant="secondary"
                  className="px-6"
                >
                  ← Previous
                </Button>
              )}

              {currentStep < 5 ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  className="ml-auto px-6 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Next →
                </Button>
              ) : (
                <Button
                  type="submit"
                  className="ml-auto px-8 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold"
                >
                  Submit Application 🚀
                </Button>
              )}
            </div>
          </Card>
        </form>

        {/* Help Section */}
        <div
          className={`p-6 rounded-lg ${isDarkMode ? "bg-gray-800" : "bg-white"} shadow-lg text-center`}
        >
          <p
            className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
          >
            Need help? Contact us at{" "}
            <span className="text-blue-600 font-medium">
              support@vendorvault.com
            </span>{" "}
            or call{" "}
            <span className="text-blue-600 font-medium">1800-123-4567</span>
          </p>
        </div>
      </div>
    </div>
  );
}
