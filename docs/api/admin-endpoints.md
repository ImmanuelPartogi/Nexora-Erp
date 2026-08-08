---
last_updated: 2026-08-08
status: Active
related_files:
  - apps/admin-backend/src/routes/tenants.routes.ts
  - apps/admin-backend/src/routes/analytics.routes.ts
  - apps/tenant-backend/src/modules/internal/internal.routes.ts
---

# Admin Backend API Reference

All endpoints in `admin-backend` are prefixed with `/api/v1` and require `Bearer <JWT_TOKEN>` authentication header with `SUPERADMIN` role privileges unless specified otherwise.

---

## 1. Tenant Monitoring

### `GET /api/v1/tenants`
- **Access**: Private (`SUPERADMIN` only)
- **Description**: Returns list of tenant companies with user counts.
- **Response**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "comp_123",
        "name": "PT Acme Indonesia",
        "industryType": "Manufacturing",
        "isActive": true,
        "userCount": 12,
        "createdAt": "2026-01-01T00:00:00.000Z"
      }
    ]
  }
  ```

### `GET /api/v1/tenants/:id/stats`
- **Access**: Private (`SUPERADMIN` only)
- **Description**: Returns request count and error metrics for a specified tenant ID.
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "tenantId": "comp_123",
      "stats": {
        "tenantId": "comp_123",
        "requestCount": 540,
        "errorCount": 2
      },
      "overallTotalRequests": 12500,
      "overallTotalErrors": 15
    }
  }
  ```

---

## 2. Platform Analytics

### `GET /api/v1/analytics/api-usage`
- **Access**: Private (`SUPERADMIN` only)
- **Description**: Returns top called API endpoints across the platform with request counts and average response times.
- **Response**:
  ```json
  {
    "success": true,
    "data": [
      {
        "endpoint": "/api/v1/products",
        "method": "GET",
        "requestCount": 4200,
        "avgResponseTimeMs": 45
      }
    ]
  }
  ```

### `GET /api/v1/analytics/errors`
- **Access**: Private (`SUPERADMIN` only)
- **Description**: Returns recent 500+ server error requests with tenant ID, status code, response time, and timestamp metadata.
- **Response**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "req_550",
        "endpoint": "/api/v1/transactions",
        "method": "POST",
        "tenantId": "comp_123",
        "statusCode": 500,
        "responseTimeMs": 120,
        "timestamp": "2026-08-08T10:00:00.000Z"
      }
    ]
  }
  ```
