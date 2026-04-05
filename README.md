# Finance Dashboard Backend

## Overview

A production-ready Node.js TypeScript backend API for personal finance management. This REST API provides secure transaction tracking, financial analytics, and role-based access control for a multi-user finance dashboard application. Built with Express.js, PostgreSQL, and Prisma ORM with comprehensive security features including JWT authentication, rate limiting, and RBAC enforcement.

## Tech Stack

| Technology | Purpose | Version |
|------------|---------|---------|
| Node.js | JavaScript runtime | 16+ |
| TypeScript | Type-safe JavaScript | 5.0.0 |
| Express.js | Web framework | 5.2.1 |
| PostgreSQL | Database | 15+ |
| Prisma | ORM | 5.0.0 |
| JWT (jsonwebtoken) | Authentication tokens | 9.0.3 |
| Zod | Schema validation | 4.3.6 |
| Jest | Testing framework | 30.3.0 |
| Helmet | Security headers | 8.1.0 |
| bcryptjs | Password hashing | 3.0.3 |
| express-rate-limit | Request throttling | 8.3.2 |

## Prerequisites

- **Node.js** (v16 or higher)
- **PostgreSQL** (v15 or higher)
- **npm** or **yarn** package manager
- **Git** for version control

Verify installations:
```bash
node --version
npm --version
psql --version
```

## Quick Start

### 1. Clone the repository
```bash
git clone <repository-url>
cd finance-dashboard-backend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
```bash
cp .env.example .env
```

Edit `.env` with your PostgreSQL credentials and JWT secrets:
```bash
NODE_ENV=development
PORT=3000
API_PREFIX=/api/v1
DATABASE_URL=postgresql://user:password@localhost:5432/finance_db
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-refresh-secret-here
JWT_REFRESH_EXPIRES_IN=30d
BCRYPT_ROUNDS=10
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 4. Set up the database
```bash
# Run migrations
npm run db:migrate

# Seed with default data
npm run db:seed
```

### 5. Start the development server
```bash
npm run dev
```

Server will be available at `http://localhost:3000`

## Default Users (after seeding)

| Email | Password | Role |
|-------|----------|------|
| admin@finance.dev | Admin@123 | ADMIN |
| analyst@finance.dev | Analyst@123 | ANALYST |
| viewer@finance.dev | Viewer@123 | VIEWER |

## Environment Variables

| Variable | Required | Description | Default |
|----------|----------|-------------|---------|
| `NODE_ENV` | Yes | Application environment | development |
| `PORT` | Yes | Server port | 3000 |
| `API_PREFIX` | Yes | API route prefix | /api/v1 |
| `DATABASE_URL` | Yes | PostgreSQL connection string | N/A |
| `JWT_SECRET` | Yes | Secret for signing access tokens | N/A |
| `JWT_EXPIRES_IN` | Yes | Access token expiration time | 7d |
| `JWT_REFRESH_SECRET` | Yes | Secret for signing refresh tokens | N/A |
| `JWT_REFRESH_EXPIRES_IN` | Yes | Refresh token expiration time | 30d |
| `BCRYPT_ROUNDS` | No | Password hashing rounds | 10 |
| `RATE_LIMIT_WINDOW_MS` | No | Rate limit window in milliseconds | 900000 (15 min) |
| `RATE_LIMIT_MAX_REQUESTS` | No | Max requests per window | 100 |

## API Reference

### Base URL
All endpoints are prefixed with `/api/v1`

Example: `http://localhost:3000/api/v1/auth/login`

### Authentication

All protected endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <access_token>
```

#### Obtaining a Token

1. **Login** with credentials (see Default Users)
   ```bash
   POST /api/v1/auth/login
   Content-Type: application/json

   {
     "email": "admin@finance.dev",
     "password": "Admin@123"
   }
   ```

2. **Response** contains access and refresh tokens:
   ```json
   {
     "statusCode": 200,
     "success": true,
     "message": "Login successful",
     "data": {
       "user": { "id": "...", "email": "...", "role": "ADMIN" },
       "accessToken": "eyJhbGc...",
       "refreshToken": "eyJhbGc..."
     }
   }
   ```

3. **Use the accessToken** in subsequent requests
4. **Refresh** token when expired using the refresh token endpoint

### Endpoints

#### Authentication

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/auth/login` | No | Authenticate with email and password, returns access & refresh tokens |
| POST | `/auth/refresh` | No | Refresh expired access token using refresh token |
| GET | `/auth/profile` | Yes (Any) | Get current authenticated user's profile |

**Login Request:**
```json
{
  "email": "admin@finance.dev",
  "password": "Admin@123"
}
```

**Refresh Request:**
```json
{
  "refreshToken": "eyJhbGc..."
}
```

#### Users (Admin Only)

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/users` | ADMIN | List all users with pagination and filtering |
| POST | `/users` | ADMIN | Create a new user account |
| GET | `/users/:id` | ADMIN | Get specific user by ID |
| PATCH | `/users/:id` | ADMIN | Update user role or status |
| DELETE | `/users/:id` | ADMIN | Delete user account |

**Create User:**
```json
{
  "email": "newuser@finance.dev",
  "password": "SecurePassword123",
  "role": "ANALYST"
}
```

**Update User:**
```json
{
  "role": "VIEWER"
}
```

#### Transactions

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/transactions` | Any | List all transactions with filtering and pagination |
| POST | `/transactions` | ANALYST+ | Create a new transaction record |
| GET | `/transactions/:id` | Any | Get specific transaction by ID |
| PATCH | `/transactions/:id` | ANALYST+ | Update transaction (own or admin) |
| DELETE | `/transactions/:id` | ANALYST+ | Soft delete transaction (own or admin) |

**Create Transaction:**
```json
{
  "description": "Grocery shopping",
  "amount": 125.50,
  "type": "EXPENSE",
  "categoryId": "cat_123",
  "date": "2026-04-05"
}
```

**Query Parameters (GET /transactions):**
- `page`: Page number (default: 1)
- `limit`: Records per page (default: 10)
- `type`: Filter by INCOME or EXPENSE
- `sortBy`: Sort field (date, amount, createdAt)
- `sortOrder`: asc or desc

Example: `/transactions?page=1&limit=20&type=EXPENSE&sortOrder=desc`

#### Dashboard

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/dashboard/summary` | Any | Get total income, expenses, and net balance |
| GET | `/dashboard/categories` | Any | Get spending/income breakdown by category |
| GET | `/dashboard/trends` | Any | Get monthly income and expense trends |
| GET | `/dashboard/recent` | Any | Get recent transaction activity |

**Query Parameters:**
- `/dashboard/trends?months=6` - Get last N months (default: 12)
- `/dashboard/recent?limit=10` - Limit recent transactions (default: 5)

**Summary Response:**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Summary retrieved",
  "data": {
    "totalIncome": 5000.00,
    "totalExpenses": 2500.00,
    "netBalance": 2500.00,
    "savingsRate": 50.00
  }
}
```

**Trends Response:**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Trends retrieved",
  "data": [
    {
      "month": "2026-04",
      "income": 5000.00,
      "expense": 2500.00,
      "net": 2500.00
    }
  ]
}
```

### Response Format

All responses follow a standardized envelope format:

**Success Response:**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Operation successful",
  "data": {
    "id": "123",
    "email": "user@finance.dev"
  },
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 50
  }
}
```

**Error Response:**
```json
{
  "statusCode": 422,
  "success": false,
  "message": "Validation error",
  "data": {
    "errors": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  }
}
```

**Status Codes:**
- `200` - OK: Request succeeded
- `201` - Created: Resource successfully created
- `400` - Bad Request: Invalid request format
- `401` - Unauthorized: Missing or invalid authentication
- `403` - Forbidden: Insufficient permissions
- `404` - Not Found: Resource doesn't exist
- `422` - Unprocessable Entity: Validation failed
- `429` - Too Many Requests: Rate limit exceeded
- `500` - Internal Server Error: Server error

## Role Permissions

| Permission | VIEWER | ANALYST | ADMIN |
|-----------|--------|---------|-------|
| View transactions | ✅ | ✅ | ✅ |
| Create transactions | ❌ | ✅ | ✅ |
| Update own transactions | ❌ | ✅ | ✅ |
| Update any transaction | ❌ | ❌ | ✅ |
| Delete own transactions | ❌ | ✅ | ✅ |
| Delete any transaction | ❌ | ❌ | ✅ |
| View dashboard | ✅ | ✅ | ✅ |
| Manage users | ❌ | ❌ | ✅ |
| View all users | ❌ | ❌ | ✅ |
| Manage categories | ❌ | ❌ | ✅ |

## Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage report
npm run test:coverage

# Run specific test file
npm test -- tests/integration/auth.test.ts

# Run tests matching a pattern
npm test -- --testNamePattern="login"

# Watch mode for development
npm test -- --watch
```

Test coverage threshold: **65%** (current: 74.35%)

## Database Scripts

```bash
# Create and run migrations
npm run db:migrate

# Seed database with default data
npm run db:seed

# Open Prisma Studio (visual database explorer)
npm run db:studio

# Type-check without emitting
npm run lint
```

## Build & Deployment

```bash
# Build for production
npm run build

# Start production server
npm start
```

The build output will be in the `dist/` directory.

## Assumptions Made

- **Soft Delete for Audit Trail**: Transactions are soft-deleted (marked as deleted) rather than permanently removed, preserving audit history and maintaining referential integrity for financial records.

- **Decimal Precision for Currency**: Transaction amounts are stored as PostgreSQL `Decimal` type with 10 digits total and 2 decimal places, ensuring accurate financial calculations without floating-point errors.

- **JWT for Stateless Authentication**: Token-based authentication using JWT allows the API to be horizontally scalable without requiring shared session storage or sticky sessions.

- **Role-Based Access Control (RBAC)**: Three distinct roles (VIEWER, ANALYST, ADMIN) with clearly defined permissions; users can only manage transactions they own unless they have ADMIN role.

- **Idempotent API Design**: All GET requests are side-effect free; POST requests create resources; PATCH requests update; DELETE requests soft-delete. This enables safe retries on client-side.

- **UTC Timestamps**: All dates and times are stored in UTC timezone in the database to avoid timezone-related inconsistencies and ensure consistent behavior across different server regions.

- **Rate Limiting by IP**: Rate limiting (100 requests per 15 minutes) is applied globally at the middleware level to prevent abuse and ensure fair resource allocation across all clients.

## Deployment

### Railway

1. Push code to GitHub
2. Connect repository to Railway
3. Set environment variables in Railway dashboard
4. Railway automatically detects Node.js and builds the project
5. Deploy with `npm start` command

### Docker Compose (Local)

```bash
docker-compose up
```

Ensure `.env` is configured with Docker service names:
```
DATABASE_URL=postgresql://postgres:password@postgres:5432/finance_db
```

### Manual Deployment

1. Build the application: `npm run build`
2. Set production environment variables
3. Run migrations: `npm run db:migrate`
4. Seed database: `npm run db:seed`
5. Start server: `npm start`

## Project Structure

```
finance-dashboard-backend/
├── src/
│   ├── app.ts                 # Express application factory
│   ├── server.ts              # Server entry point
│   ├── config/                # Configuration
│   │   ├── database.ts
│   │   ├── env.ts
│   │   └── constants.ts
│   ├── middleware/            # Express middleware
│   │   ├── auth.middleware.ts
│   │   ├── error.middleware.ts
│   │   ├── rbac.middleware.ts
│   │   └── validate.middleware.ts
│   ├── modules/               # Feature modules
│   │   ├── auth/
│   │   ├── users/
│   │   ├── transactions/
│   │   └── dashboard/
│   └── utils/                 # Utility functions
│       ├── ApiResponse.ts
│       ├── ApiError.ts
│       └── pagination.ts
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.ts                # Seed script
├── tests/                     # Test suites
│   ├── integration/
│   └── setup.ts
├── .env.example               # Environment template
├── jest.config.ts             # Jest configuration
├── tsconfig.json              # TypeScript configuration
├── package.json               # Dependencies and scripts
└── README.md                  # This file
```

## Support & Documentation

For API debugging:
- Use Postman or REST Client to test endpoints
- Check `npm run lint` for TypeScript errors
- Review console logs in development mode
- Check database state with `npm run db:studio`

## License

ISC
