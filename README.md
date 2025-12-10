Below is a **clean, rewritten, submission-ready README.md** that fulfills all assignment requirements:

* ✔ Clear project intro & problem statement
* ✔ Folder structure + purpose of each folder
* ✔ Naming conventions
* ✔ Explanation of how the architecture supports **scalability & clarity**
* ✔ Setup instructions
* ✔ Screenshot section (with your provided screenshot)

---

# 🚆 VendorVault — Digital Railway Vendor Licensing & Verification System

VendorVault is a **full-stack Next.js platform** designed to modernize the licensing, renewal, and on-site verification of railway station vendors.
The system replaces slow, paper-based processes with **digital licensing, cloud document storage, and QR-based verification**.

---

## 📌 Problem Statement

Indian railway vendors currently depend on **manual paperwork**, which causes:

* Delayed license approvals
* Difficult manual inspections
* High risk of lost or forged documents
* No centralized tracking

VendorVault solves this by offering a **secure, scalable, digital licensing system** for vendors, admins, and inspectors.

---

# 📁 Folder Structure & Purpose of Each Directory

```
root/
│
├── app/
│   ├── admin/          # Admin dashboards, approval workflows
│   ├── api/            # Next.js API routes (auth, vendor CRUD, verification)
│   ├── auth/           # Authentication pages & logic
│   ├── vendor/         # Vendor dashboard, license forms, uploads
│   ├── verify/         # Public license verification route
│   ├── favicon.ico
│   ├── globals.css      # Global styling
│   ├── layout.tsx       # App layout wrapper
│   └── page.tsx         # Home page
│
├── components/         # Reusable UI components (form, buttons, cards, modals)
│
├── lib/                # Utility libs (db connection, auth helpers, S3/Azure utils)
│
├── services/           # Business-logic modules (email, license generator, QR code)
│
├── types/              # TypeScript interfaces & type definitions
│
├── utils/              # Helper functions—validation, formatting, constants
│
├── public/             # Static assets (icons, QR exports, images)
│
├── node_modules/       # Dependencies (auto-generated)
│
├── .gitignore
├── package.json
├── tsconfig.json
├── next.config.ts
└── README.md
```

---

# 🏷️ Naming Conventions

### **Files & Folders**

| Type            | Convention                      | Example                       |
| --------------- | ------------------------------- | ----------------------------- |
| Component Files | `PascalCase`                    | `VendorCard.tsx`              |
| Utility Files   | `camelCase`                     | `formatDate.ts`               |
| API Routes      | `lowercase` with hyphens        | `apply-license/route.ts`      |
| Folders         | Meaningful, domain-driven names | `vendor`, `admin`, `services` |

### **Database & Types**

* Models → **PascalCase** (`Vendor`, `License`)
* Fields → **camelCase** (`licenseNumber`, `expiryDate`)

### **Variables & Functions**

* Functions → **camelCase** (`generateQrCode`)
* Constants → `UPPER_SNAKE_CASE` (`MAX_FILE_SIZE`)

This consistent naming improves readability, auto-completion, and teamwork clarity.

---

# 🧱 Why This Structure? — Scalability & Clarity Reflection

The project uses a **domain-driven folder structure**, which separates concerns and makes the codebase scalable for future sprints.

### ✔ **Modular Logic**

* `services/` keeps business logic independent of UI → easy to upgrade or reuse.
* `lib/` isolates infrastructure (DB, storage, auth).

### ✔ **Clear Role-based Flow**

* Separate `vendor/`, `admin/`, and `verify/` routes reduce merge conflicts and improve team ownership.

### ✔ **Maintainability**

* UI components live in `components/`, enabling rapid UI expansion.
* Types are centralized → reduces bugs and mismatches.

### ✔ **Future Scaling Ready**

Supports planned features such as:

* Inspector mobile app
* Analytics dashboards
* Vendor category expansions
* Cloud multi-region deployment

The structure ensures each sprint can add new modules without rewriting the existing codebase.

---

# ⚙️ Setup Instructions

### 1️⃣ Clone the repository

```bash
git clone https://github.com/kalviumcommunity/S86-1225-Synergy-Full-Stack-With-NextjsAnd-AWS-Azure-VendorVault.git
```

### 2️⃣ Install dependencies

```bash
npm install
```

### 3️⃣ Create a `.env` file

```env
DATABASE_URL=
NEXTAUTH_SECRET=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_S3_BUCKET=
EMAIL_SERVICE_API_KEY=
```

### 4️⃣ Run database migrations

```bash
npx prisma migrate dev
```

### 5️⃣ Start the development server

```bash
npm run dev
```

➡ Your app will run on
**[http://localhost:3000](http://localhost:3000)**

---

# 🖼️ Screenshot of Local App Running

![Image](../S86-1225-Synergy-Full-Stack-With-NextjsAnd-AWS-Azure-VendorVault/vendorvault/assets/project_setup.png)


