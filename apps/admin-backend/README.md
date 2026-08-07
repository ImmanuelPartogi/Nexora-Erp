# Nexora ERP – Admin Panel Backend

Backend service khusus untuk platform owner / superadmin Nexora ERP.

## 🎯 Tujuan App
Aplikasi ini terpisah total dari backend tenant (`/apps/tenant-backend`). Berfungsi khusus untuk:
- Monitoring kesehatan platform lintas tenant (*platform-wide metrics*).
- Manajemen siklus hidup tenant (provisioning, status langganan, suspend/active).
- System-wide audit logging dan tata kelola platform.

> **Catatan Arsitektur:** Aplikasi ini **TIDAK** memproses logika bisnis operasional tenant.
