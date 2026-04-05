/**
 * Generate Swagger API documentation HTML
 * @returns HTML string with complete API documentation
 */
export function generateSwaggerHtml(): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Finance Dashboard API - Documentation</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      padding: 40px 20px;
      color: #333;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      background: white;
      border-radius: 12px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      overflow: hidden;
    }

    header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 40px;
      text-align: center;
    }

    header h1 {
      font-size: 2.5em;
      margin-bottom: 10px;
      font-weight: 700;
    }

    header p {
      font-size: 1.1em;
      opacity: 0.95;
    }

    .content {
      padding: 40px;
    }

    .section {
      margin-bottom: 50px;
    }

    .section-title {
      font-size: 1.8em;
      color: #667eea;
      margin-bottom: 20px;
      border-bottom: 3px solid #667eea;
      padding-bottom: 10px;
      font-weight: 600;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      background: #f8f9fa;
      border-radius: 8px;
      overflow: hidden;
    }

    thead {
      background: #f0f2f5;
      border-bottom: 2px solid #e0e0e0;
    }

    th {
      padding: 15px;
      text-align: left;
      font-weight: 600;
      color: #333;
      font-size: 0.95em;
    }

    td {
      padding: 15px;
      border-bottom: 1px solid #e0e0e0;
      font-size: 0.95em;
    }

    tr:last-child td {
      border-bottom: none;
    }

    tbody tr:hover {
      background: #f0f2f5;
    }

    .method {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 4px;
      font-weight: 600;
      font-size: 0.85em;
      white-space: nowrap;
      min-width: 60px;
      text-align: center;
    }

    .method.get {
      background: #d4edda;
      color: #155724;
    }

    .method.post {
      background: #d1ecf1;
      color: #0c5460;
    }

    .method.patch {
      background: #fff3cd;
      color: #856404;
    }

    .method.delete {
      background: #f8d7da;
      color: #721c24;
    }

    .endpoint {
      font-family: "Courier New", monospace;
      background: #f5f5f5;
      padding: 6px 10px;
      border-radius: 4px;
      font-size: 0.9em;
    }

    .role {
      display: inline-block;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 0.85em;
      font-weight: 500;
    }

    .role.public {
      background: #e8f5e9;
      color: #2e7d32;
    }

    .role.viewer {
      background: #e3f2fd;
      color: #1565c0;
    }

    .role.analyst {
      background: #f3e5f5;
      color: #6a1b9a;
    }

    .role.admin {
      background: #ffebee;
      color: #c62828;
    }

    .auth-badge {
      display: inline-block;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 0.85em;
      font-weight: 500;
    }

    .auth-required {
      background: #ffebee;
      color: #c62828;
    }

    .auth-optional {
      background: #e8f5e9;
      color: #2e7d32;
    }

    .info-box {
      background: #e8f4f8;
      border-left: 4px solid #0288d1;
      padding: 15px 20px;
      margin-bottom: 30px;
      border-radius: 4px;
    }

    .info-box h3 {
      color: #01579b;
      margin-bottom: 8px;
      font-size: 1.05em;
    }

    .info-box p {
      color: #0277bd;
      line-height: 1.6;
    }

    .info-box code {
      background: #b3e5fc;
      padding: 2px 6px;
      border-radius: 3px;
      font-family: "Courier New", monospace;
      font-size: 0.9em;
    }

    footer {
      background: #f5f5f5;
      border-top: 1px solid #e0e0e0;
      padding: 20px 40px;
      text-align: center;
      color: #666;
      font-size: 0.9em;
    }

    .legend {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 15px;
      margin-bottom: 30px;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .legend-badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 4px;
      font-size: 0.85em;
      font-weight: 600;
      min-width: 50px;
      text-align: center;
    }

    @media (max-width: 768px) {
      header h1 {
        font-size: 1.8em;
      }

      table {
        font-size: 0.85em;
      }

      th, td {
        padding: 10px;
      }

      .endpoint {
        font-size: 0.8em;
        padding: 4px 8px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>💰 Finance Dashboard API</h1>
      <p>Complete API Reference & Documentation</p>
    </header>

    <div class="content">
      <div class="info-box">
        <h3>🔐 Authentication</h3>
        <p>All protected endpoints require a Bearer token in the Authorization header: <code>Authorization: Bearer &lt;token&gt;</code></p>
      </div>

      <div class="legend">
        <div class="legend-item">
          <span class="legend-badge method get">GET</span>
          <span>Retrieve data</span>
        </div>
        <div class="legend-item">
          <span class="legend-badge method post">POST</span>
          <span>Create resource</span>
        </div>
        <div class="legend-item">
          <span class="legend-badge method patch">PATCH</span>
          <span>Update resource</span>
        </div>
        <div class="legend-item">
          <span class="legend-badge method delete">DELETE</span>
          <span>Delete resource</span>
        </div>
      </div>

      <!-- Authentication Endpoints -->
      <div class="section">
        <h2 class="section-title">🔑 Authentication</h2>
        <table>
          <thead>
            <tr>
              <th style="width: 10%">Method</th>
              <th style="width: 35%">Endpoint</th>
              <th style="width: 25%">Auth</th>
              <th style="width: 30%">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><span class="method post">POST</span></td>
              <td><span class="endpoint">/auth/login</span></td>
              <td><span class="auth-badge auth-optional">Public</span></td>
              <td>Authenticate with email & password, get tokens</td>
            </tr>
            <tr>
              <td><span class="method post">POST</span></td>
              <td><span class="endpoint">/auth/refresh</span></td>
              <td><span class="auth-badge auth-optional">Public</span></td>
              <td>Refresh expired access token</td>
            </tr>
            <tr>
              <td><span class="method get">GET</span></td>
              <td><span class="endpoint">/auth/profile</span></td>
              <td><span class="auth-badge auth-required">Any Role</span></td>
              <td>Get current user profile</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Categories Endpoints -->
      <div class="section">
        <h2 class="section-title">📂 Categories</h2>
        <table>
          <thead>
            <tr>
              <th style="width: 10%">Method</th>
              <th style="width: 35%">Endpoint</th>
              <th style="width: 25%">Auth</th>
              <th style="width: 30%">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><span class="method get">GET</span></td>
              <td><span class="endpoint">/categories</span></td>
              <td><span class="auth-badge auth-optional">Public</span></td>
              <td>List all categories</td>
            </tr>
            <tr>
              <td><span class="method post">POST</span></td>
              <td><span class="endpoint">/categories</span></td>
              <td><span class="role admin">ADMIN</span></td>
              <td>Create new category</td>
            </tr>
            <tr>
              <td><span class="method delete">DELETE</span></td>
              <td><span class="endpoint">/categories/:id</span></td>
              <td><span class="role admin">ADMIN</span></td>
              <td>Delete category (if no transactions)</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Transactions Endpoints -->
      <div class="section">
        <h2 class="section-title">💳 Transactions</h2>
        <table>
          <thead>
            <tr>
              <th style="width: 10%">Method</th>
              <th style="width: 35%">Endpoint</th>
              <th style="width: 25%">Auth</th>
              <th style="width: 30%">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><span class="method get">GET</span></td>
              <td><span class="endpoint">/transactions</span></td>
              <td><span class="auth-badge auth-required">Any Role</span></td>
              <td>List transactions (filterable, paginated, searchable)</td>
            </tr>
            <tr>
              <td><span class="method get">GET</span></td>
              <td><span class="endpoint">/transactions/deleted</span></td>
              <td><span class="role admin">ADMIN</span></td>
              <td>List soft-deleted transactions (ADMIN only)</td>
            </tr>
            <tr>
              <td><span class="method get">GET</span></td>
              <td><span class="endpoint">/transactions/:id</span></td>
              <td><span class="auth-badge auth-required">Any Role</span></td>
              <td>Get transaction by ID</td>
            </tr>
            <tr>
              <td><span class="method post">POST</span></td>
              <td><span class="endpoint">/transactions</span></td>
              <td><span class="role analyst">ANALYST+</span></td>
              <td>Create new transaction</td>
            </tr>
            <tr>
              <td><span class="method patch">PATCH</span></td>
              <td><span class="endpoint">/transactions/:id</span></td>
              <td><span class="role analyst">ANALYST+</span></td>
              <td>Update transaction (own or ADMIN)</td>
            </tr>
            <tr>
              <td><span class="method delete">DELETE</span></td>
              <td><span class="endpoint">/transactions/:id</span></td>
              <td><span class="role analyst">ANALYST+</span></td>
              <td>Soft delete transaction (own or ADMIN)</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Users Endpoints -->
      <div class="section">
        <h2 class="section-title">👥 Users</h2>
        <table>
          <thead>
            <tr>
              <th style="width: 10%">Method</th>
              <th style="width: 35%">Endpoint</th>
              <th style="width: 25%">Auth</th>
              <th style="width: 30%">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><span class="method get">GET</span></td>
              <td><span class="endpoint">/users</span></td>
              <td><span class="role admin">ADMIN</span></td>
              <td>List all users (paginated, filterable)</td>
            </tr>
            <tr>
              <td><span class="method get">GET</span></td>
              <td><span class="endpoint">/users/:id</span></td>
              <td><span class="role admin">ADMIN</span></td>
              <td>Get user by ID</td>
            </tr>
            <tr>
              <td><span class="method post">POST</span></td>
              <td><span class="endpoint">/users</span></td>
              <td><span class="role admin">ADMIN</span></td>
              <td>Create new user</td>
            </tr>
            <tr>
              <td><span class="method patch">PATCH</span></td>
              <td><span class="endpoint">/users/:id</span></td>
              <td><span class="role admin">ADMIN</span></td>
              <td>Update user role or status</td>
            </tr>
            <tr>
              <td><span class="method delete">DELETE</span></td>
              <td><span class="endpoint">/users/:id</span></td>
              <td><span class="role admin">ADMIN</span></td>
              <td>Delete user</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Dashboard Endpoints -->
      <div class="section">
        <h2 class="section-title">📊 Dashboard</h2>
        <table>
          <thead>
            <tr>
              <th style="width: 10%">Method</th>
              <th style="width: 35%">Endpoint</th>
              <th style="width: 25%">Auth</th>
              <th style="width: 30%">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><span class="method get">GET</span></td>
              <td><span class="endpoint">/dashboard/summary</span></td>
              <td><span class="auth-badge auth-required">Any Role</span></td>
              <td>Get financial summary (income, expenses, net balance)</td>
            </tr>
            <tr>
              <td><span class="method get">GET</span></td>
              <td><span class="endpoint">/dashboard/categories</span></td>
              <td><span class="auth-badge auth-required">Any Role</span></td>
              <td>Get spending breakdown by category</td>
            </tr>
            <tr>
              <td><span class="method get">GET</span></td>
              <td><span class="endpoint">/dashboard/trends</span></td>
              <td><span class="auth-badge auth-required">Any Role</span></td>
              <td>Get monthly income/expense trends</td>
            </tr>
            <tr>
              <td><span class="method get">GET</span></td>
              <td><span class="endpoint">/dashboard/recent</span></td>
              <td><span class="auth-badge auth-required">Any Role</span></td>
              <td>Get recent transaction activity</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Query Parameters -->
      <div class="section">
        <h2 class="section-title">🔍 Query Parameters</h2>
        
        <h3 style="color: #555; margin-top: 20px; margin-bottom: 10px; font-size: 1.1em;">Transactions (/transactions)</h3>
        <table>
          <thead>
            <tr>
              <th style="width: 20%">Parameter</th>
              <th style="width: 20%">Type</th>
              <th style="width: 20%">Default</th>
              <th style="width: 40%">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>page</code></td>
              <td>number</td>
              <td>1</td>
              <td>Page number for pagination</td>
            </tr>
            <tr>
              <td><code>limit</code></td>
              <td>number</td>
              <td>10</td>
              <td>Records per page (max: 100)</td>
            </tr>
            <tr>
              <td><code>type</code></td>
              <td>enum</td>
              <td>—</td>
              <td>Filter by INCOME or EXPENSE</td>
            </tr>
            <tr>
              <td><code>categoryId</code></td>
              <td>string</td>
              <td>—</td>
              <td>Filter by category ID</td>
            </tr>
            <tr>
              <td><code>startDate</code></td>
              <td>date</td>
              <td>—</td>
              <td>Filter by date range start (YYYY-MM-DD)</td>
            </tr>
            <tr>
              <td><code>endDate</code></td>
              <td>date</td>
              <td>—</td>
              <td>Filter by date range end (YYYY-MM-DD)</td>
            </tr>
            <tr>
              <td><code>minAmount</code></td>
              <td>number</td>
              <td>—</td>
              <td>Filter by minimum amount</td>
            </tr>
            <tr>
              <td><code>maxAmount</code></td>
              <td>number</td>
              <td>—</td>
              <td>Filter by maximum amount</td>
            </tr>
            <tr>
              <td><code>search</code></td>
              <td>string</td>
              <td>—</td>
              <td>Search in notes, category name, or amount</td>
            </tr>
            <tr>
              <td><code>includeDeleted</code></td>
              <td>boolean</td>
              <td>false</td>
              <td>Include soft-deleted (ADMIN only)</td>
            </tr>
          </tbody>
        </table>

        <h3 style="color: #555; margin-top: 20px; margin-bottom: 10px; font-size: 1.1em;">Dashboard Trends (/dashboard/trends)</h3>
        <table>
          <thead>
            <tr>
              <th style="width: 20%">Parameter</th>
              <th style="width: 20%">Type</th>
              <th style="width: 20%">Default</th>
              <th style="width: 40%">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>months</code></td>
              <td>number</td>
              <td>6</td>
              <td>Number of months to retrieve</td>
            </tr>
          </tbody>
        </table>

        <h3 style="color: #555; margin-top: 20px; margin-bottom: 10px; font-size: 1.1em;">Dashboard Recent (/dashboard/recent)</h3>
        <table>
          <thead>
            <tr>
              <th style="width: 20%">Parameter</th>
              <th style="width: 20%">Type</th>
              <th style="width: 20%">Default</th>
              <th style="width: 40%">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>limit</code></td>
              <td>number</td>
              <td>10</td>
              <td>Number of recent transactions to retrieve</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Role Hierarchy -->
      <div class="section">
        <h2 class="section-title">👤 Role Hierarchy & Permissions</h2>
        <table>
          <thead>
            <tr>
              <th style="width: 15%">Role</th>
              <th style="width: 85%">Permissions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><span class="role viewer">VIEWER</span></td>
              <td>View transactions, dashboard, profiles. No create/update/delete.</td>
            </tr>
            <tr>
              <td><span class="role analyst">ANALYST</span></td>
              <td>VIEWER + Create/update/delete own transactions. View users (read-only).</td>
            </tr>
            <tr>
              <td><span class="role admin">ADMIN</span></td>
              <td>All permissions. Manage users, categories, view/delete any transaction.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Response Format -->
      <div class="section">
        <h2 class="section-title">📝 Response Format</h2>
        <div class="info-box">
          <h3>Success Response (2xx)</h3>
          <p style="font-family: monospace; margin-top: 10px; white-space: pre-wrap; background: white; padding: 10px; border-radius: 4px; overflow-x: auto;">
{
  "statusCode": 200,
  "success": true,
  "message": "Operation successful",
  "data": { /* Response data */ },
  "meta": { "page": 1, "limit": 10, "total": 50 }
}
          </p>
        </div>
        <div class="info-box">
          <h3>Error Response (4xx/5xx)</h3>
          <p style="font-family: monospace; margin-top: 10px; white-space: pre-wrap; background: white; padding: 10px; border-radius: 4px; overflow-x: auto;">
{
  "statusCode": 422,
  "success": false,
  "message": "Validation error",
  "data": {
    "errors": [
      { "field": "email", "message": "Invalid email format" }
    ]
  }
}
          </p>
        </div>
      </div>

    </div>

    <footer>
      <p>Finance Dashboard API v1.0 • Last updated: April 5, 2026</p>
      <p>Base URL: <code style="background: #f0f0f0; padding: 2px 4px; border-radius: 2px;">http://localhost:3000/api/v1</code></p>
    </footer>
  </div>
</body>
</html>
  `;
}
