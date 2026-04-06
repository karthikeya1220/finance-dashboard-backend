import swaggerJsdoc from "swagger-jsdoc";

/**
 * Swagger API documentation configuration
 * Defines OpenAPI specification for all API endpoints
 */
const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Finance Dashboard API",
      version: "1.0.0",
      description:
        "A comprehensive API for managing personal finances with transaction tracking, categorization, and analytics.",
      contact: {
        name: "Finance Dashboard Support",
        email: "support@financedashboard.com",
      },
    },
    servers: [
      {
        url: `${process.env.API_URL || "http://localhost:3000"}/api/v1`,
        description: "API Server",
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "JWT Bearer token for authentication",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            id: { type: "string", format: "cuid" },
            email: { type: "string", format: "email" },
            name: { type: "string" },
            role: { type: "string", enum: ["VIEWER", "ANALYST", "ADMIN"] },
            status: { type: "string", enum: ["ACTIVE", "INACTIVE"] },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        Category: {
          type: "object",
          properties: {
            id: { type: "string", format: "cuid" },
            name: { type: "string" },
            description: { type: "string" },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        Transaction: {
          type: "object",
          properties: {
            id: { type: "string", format: "cuid" },
            amount: { type: "number", format: "decimal" },
            type: { type: "string", enum: ["INCOME", "EXPENSE"] },
            category: { $ref: "#/components/schemas/Category" },
            notes: { type: "string" },
            date: { type: "string", format: "date-time" },
            createdById: { type: "string", format: "cuid" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
            deletedAt: { type: "string", format: "date-time", nullable: true },
          },
        },
        ApiResponse: {
          type: "object",
          properties: {
            statusCode: { type: "integer" },
            data: { type: "object" },
            message: { type: "string" },
            success: { type: "boolean" },
          },
        },
        Error: {
          type: "object",
          properties: {
            statusCode: { type: "integer" },
            message: { type: "string" },
            success: { type: "boolean" },
          },
        },
      },
    },
    security: [
      {
        BearerAuth: [],
      },
    ],
  },
  apis: [
    "./src/modules/auth/auth.routes.ts",
    "./src/modules/users/users.routes.ts",
    "./src/modules/categories/categories.routes.ts",
    "./src/modules/transactions/transactions.routes.ts",
    "./src/modules/dashboard/dashboard.routes.ts",
  ],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
