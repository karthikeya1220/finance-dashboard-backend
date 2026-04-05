import { PrismaClient, Role, TransactionType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Seed Categories
  const categories = [
    { name: "Salary", description: "Regular salary income" },
    { name: "Freelance", description: "Freelance project income" },
    { name: "Rent", description: "Rent and housing expenses" },
    { name: "Food", description: "Groceries and dining expenses" },
    { name: "Transport", description: "Transportation and fuel costs" },
    { name: "Utilities", description: "Electricity, water, and internet bills" },
    { name: "Entertainment", description: "Movies, games, and entertainment" },
    { name: "Healthcare", description: "Medical and healthcare expenses" },
  ];

  console.log("📂 Upserting categories...");
  for (const category of categories) {
    await prisma.category.upsert({
      where: { name: category.name },
      update: {},
      create: category,
    });
  }

  // Seed Users
  const users = [
    {
      email: "admin@finance.dev",
      name: "Admin User",
      password: "Admin@123",
      role: Role.ADMIN,
    },
    {
      email: "analyst@finance.dev",
      name: "Analyst User",
      password: "Analyst@123",
      role: Role.ANALYST,
    },
    {
      email: "viewer@finance.dev",
      name: "Viewer User",
      password: "Viewer@123",
      role: Role.VIEWER,
    },
  ];

  console.log("👥 Upserting users...");
  const hashedUsers: Record<string, string> = {};
  for (const user of users) {
    const passwordHash = await bcrypt.hash(user.password, 10);
    hashedUsers[user.email] = passwordHash;

    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: {
        email: user.email,
        name: user.name,
        passwordHash,
        role: user.role,
      },
    });
  }

  // Fetch users and categories for transactions
  const adminUser = await prisma.user.findUnique({
    where: { email: "admin@finance.dev" },
  });
  const analystUser = await prisma.user.findUnique({
    where: { email: "analyst@finance.dev" },
  });

  const salaryCategory = await prisma.category.findUnique({
    where: { name: "Salary" },
  });
  const freelanceCategory = await prisma.category.findUnique({
    where: { name: "Freelance" },
  });
  const rentCategory = await prisma.category.findUnique({
    where: { name: "Rent" },
  });
  const foodCategory = await prisma.category.findUnique({
    where: { name: "Food" },
  });
  const transportCategory = await prisma.category.findUnique({
    where: { name: "Transport" },
  });
  const utilitiesCategory = await prisma.category.findUnique({
    where: { name: "Utilities" },
  });
  const entertainmentCategory = await prisma.category.findUnique({
    where: { name: "Entertainment" },
  });
  const healthcareCategory = await prisma.category.findUnique({
    where: { name: "Healthcare" },
  });

  // Seed Transactions
  const now = new Date();
  const transactions = [
    {
      amount: 5000,
      type: TransactionType.INCOME,
      categoryId: salaryCategory!.id,
      date: new Date(now.getFullYear(), now.getMonth() - 2, 1),
      notes: "Monthly salary payment",
      createdById: adminUser!.id,
    },
    {
      amount: 1500,
      type: TransactionType.INCOME,
      categoryId: freelanceCategory!.id,
      date: new Date(now.getFullYear(), now.getMonth() - 2, 15),
      notes: "Freelance project completion",
      createdById: analystUser!.id,
    },
    {
      amount: 1200,
      type: TransactionType.EXPENSE,
      categoryId: rentCategory!.id,
      date: new Date(now.getFullYear(), now.getMonth() - 2, 5),
      notes: "Monthly rent payment",
      createdById: adminUser!.id,
    },
    {
      amount: 350,
      type: TransactionType.EXPENSE,
      categoryId: foodCategory!.id,
      date: new Date(now.getFullYear(), now.getMonth() - 2, 10),
      notes: "Grocery shopping",
      createdById: analystUser!.id,
    },
    {
      amount: 5000,
      type: TransactionType.INCOME,
      categoryId: salaryCategory!.id,
      date: new Date(now.getFullYear(), now.getMonth() - 1, 1),
      notes: "Monthly salary payment",
      createdById: adminUser!.id,
    },
    {
      amount: 150,
      type: TransactionType.EXPENSE,
      categoryId: transportCategory!.id,
      date: new Date(now.getFullYear(), now.getMonth() - 1, 8),
      notes: "Fuel and car maintenance",
      createdById: analystUser!.id,
    },
    {
      amount: 1200,
      type: TransactionType.EXPENSE,
      categoryId: rentCategory!.id,
      date: new Date(now.getFullYear(), now.getMonth() - 1, 5),
      notes: "Monthly rent payment",
      createdById: adminUser!.id,
    },
    {
      amount: 120,
      type: TransactionType.EXPENSE,
      categoryId: utilitiesCategory!.id,
      date: new Date(now.getFullYear(), now.getMonth() - 1, 12),
      notes: "Electricity and internet bill",
      createdById: analystUser!.id,
    },
    {
      amount: 5000,
      type: TransactionType.INCOME,
      categoryId: salaryCategory!.id,
      date: new Date(now.getFullYear(), now.getMonth(), 1),
      notes: "Monthly salary payment",
      createdById: adminUser!.id,
    },
    {
      amount: 80,
      type: TransactionType.EXPENSE,
      categoryId: entertainmentCategory!.id,
      date: new Date(now.getFullYear(), now.getMonth(), 5),
      notes: "Movie tickets and streaming",
      createdById: analystUser!.id,
    },
    {
      amount: 1200,
      type: TransactionType.EXPENSE,
      categoryId: rentCategory!.id,
      date: new Date(now.getFullYear(), now.getMonth(), 5),
      notes: "Monthly rent payment",
      createdById: adminUser!.id,
    },
    {
      amount: 250,
      type: TransactionType.EXPENSE,
      categoryId: healthcareCategory!.id,
      date: new Date(now.getFullYear(), now.getMonth(), 15),
      notes: "Doctor visit and medications",
      createdById: adminUser!.id,
    },
  ];

  console.log("💰 Upserting transactions...");
  for (const transaction of transactions) {
    await prisma.transaction.upsert({
      where: { id: "" }, // Use a unique identifier pattern
      update: {},
      create: transaction,
    });
  }

  console.log("✅ Database seeded successfully!");
}

main()
  .catch((error) => {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
