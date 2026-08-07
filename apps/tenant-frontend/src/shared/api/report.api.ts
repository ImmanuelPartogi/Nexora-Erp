// ============================================
// FILE: frontend/src/shared/api/report.api.ts
// ============================================

import { apiClient } from './client';
import { DashboardStats } from '../types';
import { OwnerDashboardStats } from '../types/owner-dashboard.types';

export interface ReportField {
  key:   string;
  label: string;
  type:  'string' | 'number' | 'date' | 'boolean';
}

export interface ReportEntity {
  key:    string;
  label:  string;
  fields: ReportField[];
}

export interface GenerateReportPayload {
  entity:     string;
  fields:     string[];
  startDate?: string;
  endDate?:   string;
  status?:    string;
}

export interface ReportResult {
  entity:         string;
  entityLabel:    string;
  selectedFields: ReportField[];
  totalRows:      number;
  data:           Record<string, unknown>[];
  generatedAt:    string;
  filters:        { startDate?: string; endDate?: string; status?: string };
}

export const reportApi = {
  getEntities: async (): Promise<ReportEntity[]> => {
    return apiClient.get<ReportEntity[]>('/reports/entities');
  },

  generate: async (payload: GenerateReportPayload): Promise<ReportResult> => {
    return apiClient.post<ReportResult>('/reports/generate', payload);
  },

  dashboard: async (): Promise<DashboardStats> => {
    return apiClient.get<DashboardStats>('/reports/dashboard');
  },

  ownerDashboard: async (): Promise<OwnerDashboardStats> => {
    return apiClient.get<OwnerDashboardStats>('/reports/owner-dashboard');
  },
};
