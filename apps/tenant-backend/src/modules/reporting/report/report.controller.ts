// ============================================
// FILE: backend/src/modules/reporting/report/report.controller.ts
// Enhanced: custom report endpoint + field definitions endpoint
// ============================================

import { Request, Response, NextFunction } from 'express';
import { ReportService, REPORT_ENTITY_FIELDS, REPORT_ENTITY_LABELS } from './report.service';
import { OwnerAnalyticsService } from './owner-analytics.service';

export class ReportController {
  private reportService: ReportService;
  private ownerAnalyticsService: OwnerAnalyticsService;

  constructor() {
    this.reportService = new ReportService();
    this.ownerAnalyticsService = new OwnerAnalyticsService();
  }

  // ── GET /reports/dashboard ──────────────────────────────────
  // 🔐 Permission-scoped: returns only the metrics the caller is authorized to see.
  getDashboard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const stats = await this.reportService.getDashboardStats(
        req.activeCompanyId!,
        req.user!.id
      );
      res.json({ success: true, data: stats });
    } catch (error) {
      next(error);
    }
  };

  // ── GET /reports/owner-dashboard ─────────────────────────────
  // Comprehensive Owner-only platform analytics (Owner role required).
  getOwnerDashboard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const stats = await this.ownerAnalyticsService.getOwnerDashboard(req.activeCompanyId!);
      res.json({ success: true, data: stats });
    } catch (error) {
      next(error);
    }
  };

  // ── GET /reports/entities ───────────────────────────────────
  // Kembalikan daftar semua entity + fields yang tersedia
  getEntities = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const entities = Object.entries(REPORT_ENTITY_FIELDS).map(([key, fields]) => ({
        key,
        label:  REPORT_ENTITY_LABELS[key] ?? key,
        fields,
      }));
      res.json({ success: true, data: entities });
    } catch (error) {
      next(error);
    }
  };

  // ── GET /reports/entities/:entity/fields ────────────────────
  // Kembalikan field definitions untuk 1 entity
  getEntityFields = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { entity } = req.params;
      const fields = this.reportService.getEntityFields(entity);
      res.json({ success: true, data: fields });
    } catch (error) {
      next(error);
    }
  };

  // ── POST /reports/generate ──────────────────────────────────
  // Generate custom report dengan field + filter pilihan user
  generateCustom = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { entity, fields, startDate, endDate, status } = req.body;

      const report = await this.reportService.generateCustomReport(req.activeCompanyId!, {
        entity,
        fields,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate:   endDate   ? new Date(endDate)   : undefined,
        status,
      });

      res.json({ success: true, data: report });
    } catch (error) {
      next(error);
    }
  };

  // ── GET /reports (legacy) ───────────────────────────────────
  generate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { type, startDate, endDate } = req.query;
      const report = await this.reportService.generate(req.activeCompanyId!, {
        type:      String(type),
        startDate: startDate ? new Date(String(startDate)) : undefined,
        endDate:   endDate   ? new Date(String(endDate))   : undefined,
      });
      res.json({ success: true, data: report });
    } catch (error) {
      next(error);
    }
  };
}