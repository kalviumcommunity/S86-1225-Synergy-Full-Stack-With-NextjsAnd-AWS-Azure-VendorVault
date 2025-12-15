# 🗄️ Database Migrations & Seeding with Prisma ORM

This assignment demonstrates how database migrations and seed scripts are implemented using **Prisma ORM** to ensure a consistent database structure and reproducible starting data across all environments.

---

## 📦 Database Migrations

### What Are Migrations?
Database migrations capture schema changes such as creating tables or modifying fields. Prisma migrations ensure the database stays in sync with `schema.prisma` and allows teams to track schema evolution safely.

---

### Creating the Initial Migration

To create and apply the initial database schema:

```bash
npx prisma migrate dev --name init_schema

This command:

Generates SQL migration files inside prisma/migrations/

Applies schema changes to the PostgreSQL database

Updates Prisma Client automatically

Modifying Schema & Adding New Migrations
When new models or fields are added to schema.prisma, a new migration is created:

bash
Copy code
npx prisma migrate dev --name add_project_table
Each migration is versioned and stored as SQL, allowing schema changes to be reviewed and tracked.

Resetting & Rolling Back (Development Only)
During development, the database can be reset using:

bash
Copy code
npx prisma migrate reset
This will:

Drop all existing tables

Re-apply all migrations from scratch

Optionally re-run seed scripts

⚠️ This command is never used in production environments.

🌱 Database Seeding
Purpose of Seeding
Seeding inserts initial data into the database so that all developers start with the same dataset.

Seed Script Implementation
The seed script is located at:

bash
Copy code
prisma/seed.ts
Example implementation:

ts
Copy code
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.user.createMany({
    data: [
      { name: "Alice", email: "alice@example.com" },
      { name: "Bob", email: "bob@example.com" },
    ],
    skipDuplicates: true,
  });

  console.log("Seed data inserted successfully");
}

main()
  .then(async () => await prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
The use of skipDuplicates ensures the seed script is idempotent, meaning it can be run multiple times without creating duplicate records.

Registering the Seed Script
The seed script is registered in package.json:

json
Copy code
"prisma": {
  "seed": "ts-node prisma/seed.ts"
}
Running the Seed Script
bash
Copy code
npx prisma db seed
Successful execution confirms that the initial data has been inserted.

Verifying Seed Data
Seeded data is verified using Prisma Studio:

bash
Copy code
npx prisma studio
This allows visual confirmation that data exists and remains unchanged when the seed script is re-run.

🛡️ Safety & Best Practices (Reflection)
Each schema change has its own migration for traceability

Migrations are tested locally before production deployment

Database backups are taken before applying production migrations

prisma migrate reset is avoided in production

Seed scripts are designed to be idempotent for safe reuse

📸 Evidence Provided
prisma/migrations/ directory with migration files

Terminal logs showing successful migrations

Seed execution logs

Prisma Studio screenshots confirming seeded data