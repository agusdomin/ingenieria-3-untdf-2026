import { RiskLevel } from './zone';

export interface Report {
  id: string;

  zoneId: string;
  analysisId: string;

  title: string;

  summary: string;

  riskLevel: RiskLevel;

  probability?: string;

  reactivity?: string;

  createdAt: string;

  createdBy: string;

  reliability?: {
    reliable: number;
    medium: number;
    inaccurate: number;
    total: number;
  };
}

export interface CreateReportDTO {
  analysisId: string;

  title: string;

  summary: string;

  riskLevel: RiskLevel;

  probability?: string;

  reactivity?: string;
}

export type ReportRating =
  | 'confiable'
  | 'medianamente_confiable'
  | 'impreciso';