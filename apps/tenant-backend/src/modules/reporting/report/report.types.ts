// ============================================
// REPORTING MODULE
// ============================================
// src/modules/reporting/report/report.types.ts
export interface ReportQuery {
  type: 'transactions' | 'stock' | 'lease' | 'production' | 'customer' | 'vendor';
  dateFrom?: string;
  dateTo?: string;
  format?: 'json' | 'csv';
  groupBy?: string;
}