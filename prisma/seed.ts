import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Demo app config for a CRM/Contact Management app
const demoAppConfig = {
  name: "Contact Manager",
  description: "A simple CRM to manage contacts and companies",
  version: "1.0.0",
  database: [
    {
      name: "contacts",
      displayField: "email",
      fields: [
        { name: "firstName", type: "string", required: true, label: "First Name" },
        { name: "lastName", type: "string", required: true, label: "Last Name" },
        { name: "email", type: "email", required: true, label: "Email" },
        { name: "phone", type: "string", required: false, label: "Phone" },
        { name: "company", type: "string", required: false, label: "Company" },
        { name: "status", type: "enum", required: true, label: "Status", options: ["Lead", "Prospect", "Customer", "Churned"], default: "Lead" },
        { name: "notes", type: "textarea", required: false, label: "Notes" },
        { name: "createdDate", type: "date", required: false, label: "Created Date" },
      ],
    },
    {
      name: "companies",
      displayField: "name",
      fields: [
        { name: "name", type: "string", required: true, label: "Company Name" },
        { name: "industry", type: "enum", required: false, label: "Industry", options: ["Tech", "Finance", "Healthcare", "Retail", "Other"] },
        { name: "size", type: "enum", required: false, label: "Company Size", options: ["1-10", "11-50", "51-200", "201-500", "500+"] },
        { name: "website", type: "string", required: false, label: "Website" },
        { name: "revenue", type: "number", required: false, label: "Annual Revenue", validation: { min: 0 } },
      ],
    },
  ],
  pages: [
    {
      id: "dashboard",
      name: "Dashboard",
      route: "/dashboard",
      layout: "dashboard",
      components: [
        { id: "stats-contacts", type: "stats", name: "Total Contacts", label: "Total Contacts", table: "contacts", config: { count: true } },
        { id: "stats-companies", type: "stats", name: "Total Companies", label: "Total Companies", table: "companies", config: { count: true } },
        { id: "recent-contacts", type: "table", name: "Recent Contacts", label: "Recent Contacts", table: "contacts", fields: ["firstName", "lastName", "email", "status", "company"] },
      ],
    },
    {
      id: "contacts",
      name: "Contacts",
      route: "/contacts",
      layout: "table",
      table: "contacts",
      components: [
        { id: "contacts-table", type: "table", name: "All Contacts", label: "Contacts", table: "contacts", fields: ["firstName", "lastName", "email", "phone", "company", "status"] },
        { id: "contacts-form", type: "form", name: "Add Contact", label: "Add New Contact", table: "contacts", fields: ["firstName", "lastName", "email", "phone", "company", "status", "notes"] },
      ],
    },
    {
      id: "companies",
      name: "Companies",
      route: "/companies",
      layout: "table",
      table: "companies",
      components: [
        { id: "companies-table", type: "table", name: "All Companies", label: "Companies", table: "companies", fields: ["name", "industry", "size", "website", "revenue"] },
        { id: "companies-form", type: "form", name: "Add Company", label: "Add New Company", table: "companies", fields: ["name", "industry", "size", "website", "revenue"] },
      ],
    },
  ],
  apis: [
    { path: "/api/dynamic/contacts/list", method: "GET", table: "contacts", action: "list" },
    { path: "/api/dynamic/contacts/create", method: "POST", table: "contacts", action: "create" },
    { path: "/api/dynamic/contacts/update", method: "POST", table: "contacts", action: "update" },
    { path: "/api/dynamic/companies/list", method: "GET", table: "companies", action: "list" },
    { path: "/api/dynamic/companies/create", method: "POST", table: "companies", action: "create" },
  ],
  settings: {
    theme: "light",
    requireAuth: true,
  },
};

async function seedDemoData(userId: string) {
  const config = demoAppConfig;
  
  const app = await prisma.app.create({
    data: {
      name: config.name,
      description: config.description,
      config: config as any,
      userId,
    },
  });

  // Seed some demo contacts
  const contacts = [
    { firstName: "John", lastName: "Doe", email: "john@example.com", phone: "+1-555-0101", company: "Acme Corp", status: "Customer", notes: "Long time customer", createdDate: new Date().toISOString() },
    { firstName: "Jane", lastName: "Smith", email: "jane@example.com", phone: "+1-555-0102", company: "TechStart", status: "Prospect", notes: "Interested in enterprise plan", createdDate: new Date().toISOString() },
    { firstName: "Bob", lastName: "Johnson", email: "bob@example.com", phone: "+1-555-0103", company: "Acme Corp", status: "Lead", notes: "Referred by John", createdDate: new Date().toISOString() },
    { firstName: "Alice", lastName: "Williams", email: "alice@example.com", phone: "+1-555-0104", company: "Global Inc", status: "Customer", notes: "Renewal coming up", createdDate: new Date().toISOString() },
    { firstName: "Charlie", lastName: "Brown", email: "charlie@example.com", phone: "+1-555-0105", company: "TechStart", status: "Churned", notes: "Switched to competitor", createdDate: new Date().toISOString() },
  ];

  for (const contact of contacts) {
    await prisma.dynamicRecord.create({
      data: {
        appId: app.id,
        tableName: "contacts",
        data: contact,
      },
    });
  }

  // Seed some demo companies
  const companies = [
    { name: "Acme Corp", industry: "Tech", size: "201-500", website: "https://acme.example.com", revenue: 5000000 },
    { name: "TechStart", industry: "Tech", size: "11-50", website: "https://techstart.example.com", revenue: 1200000 },
    { name: "Global Inc", industry: "Finance", size: "500+", website: "https://global.example.com", revenue: 50000000 },
  ];

  for (const company of companies) {
    await prisma.dynamicRecord.create({
      data: {
        appId: app.id,
        tableName: "companies",
        data: company,
      },
    });
  }

  return app;
}

async function main() {
  console.log("Starting seed...");
  
  // Create a demo user or use existing one
  const demoUser = await prisma.user.upsert({
    where: { email: "demo@example.com" },
    update: {},
    create: {
      email: "demo@example.com",
      name: "Demo User",
      emailVerified: new Date(),
    },
  });

  console.log("Demo user created:", demoUser.id);

  // Check if demo app already exists
  const existingApp = await prisma.app.findFirst({
    where: { userId: demoUser.id, name: "Contact Manager" },
  });

  if (!existingApp) {
    const app = await seedDemoData(demoUser.id);
    console.log("Demo app created:", app.id);
  } else {
    console.log("Demo app already exists");
  }

  console.log("Seed completed!");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
