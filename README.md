# 🚆 Railway Vendor Digital License & Verification System

A full-stack web application built with **Next.js and Cloud Services (AWS/Azure)** to digitize the onboarding, licensing, renewal, and verification of railway station vendors such as tea stalls, snack shops, and book vendors.

This platform replaces manual paper-based licensing with a **secure, cloud-hosted, QR-based digital verification system**.

---

## 📌 Problem Statement

Railway vendors still rely heavily on manual paperwork for licenses and renewals. This leads to:

* Delayed approvals
* Loss or damage of physical licenses
* Difficult on-field verification
* Lack of transparency and tracking

---

## ✅ Solution Overview

A **web-based digital licensing platform** that enables:

* 🧾 Online vendor registration & license application
* 🧑‍💼 Admin-based approval and license management
* 🔍 Instant QR-based public verification
* 🔄 Digital license renewal
* ☁️ Secure cloud document storage
* 📧 Automated notifications

---

## 👥 User Roles

### Vendor

* Register & log in
* Apply for license
* Upload documents
* Track application status
* Renew license
* View & share QR-based digital license

### Admin (Railway Authority)

* View vendor applications
* Approve / Reject licenses
* Generate License ID & QR code
* Manage renewals & revocations

### Inspector (Optional)

* Scan QR code
* Verify license in real time
* Report violations

---

## 🛠️ Tech Stack

### Frontend

* Next.js (App Router)
* Tailwind CSS / Shadcn UI
* TypeScript

### Backend

* Next.js API Routes
* Prisma ORM
* PostgreSQL / MySQL / Azure SQL

### Cloud Services

* AWS (S3, RDS, SES, Cognito)
  OR
* Azure (Blob Storage, Azure SQL, Azure AD B2C)

### Other Tools

* QR Code Generator
* JWT / NextAuth for authentication
* Email notification service

---

## ✨ Core Features

* Vendor registration & authentication
* Online license application with document upload
* Admin approval system
* QR code generation for licenses
* Public license verification page
* License renewal system
* Expiry notifications
* Secure cloud document storage

---

## 🚀 Installation & Setup

### 1. Clone the Repository

git clone [https://github.com/kalviumcommunity/S86-1225-Synergy-Full-Stack-With-NextjsAnd-AWS-Azure-VendorVault.git](https://github.com/kalviumcommunity/S86-1225-Synergy-Full-Stack-With-NextjsAnd-AWS-Azure-VendorVault.git)


### 2. Install Dependencies

npm install

### 3. Environment Variables (.env)

DATABASE_URL=
NEXTAUTH_SECRET=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_S3_BUCKET=
EMAIL_SERVICE_API_KEY=

### 4. Run Database Migration

npx prisma migrate dev

### 5. Start the Development Server

npm run dev

Application will run on:
[http://localhost:3000](http://localhost:3000)

---

## 🔍 Public License Verification

Each approved vendor receives a **QR Code**.
Scanning it opens:

/verify/{licenseNumber}

Displays:

* Vendor Name
* Stall Type
* Station Name
* License Status
* Validity Dates

---

## 🔐 Security Features

* Password hashing
* Role-based access control
* Secure file uploads
* Protected admin routes
* Token-based authentication

---

## 📊 Future Enhancements

* Aadhaar-based e-KYC
* AI document verification
* Analytics dashboard
* Mobile app for inspectors
* Railway system integrations
* Offline QR verification support

---

## 📜 License

This project is developed for academic and educational purposes only.

---

## ⭐ If you like this project, give it a star!

