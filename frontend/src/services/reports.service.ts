import { api } from '../api/client';

import {
  CreateReportDTO,
  Report,
  ReportRating,
} from '../types/report';

export const getReports =
  async (): Promise<Report[]> => {
    const response =
      await api.get('/reports');

    return response.data;
  };

export const getReport =
  async (
    id: string
  ): Promise<Report> => {
    const response =
      await api.get(
        `/reports/${id}`
      );

    return response.data;
  };

export const getReportsByZone =
  async (
    zoneId: string
  ): Promise<Report[]> => {
    const response =
      await api.get(
        `/zones/${zoneId}/reports`
      );

    return response.data;
  };

export const createReport =
  async (
    data: CreateReportDTO
  ): Promise<Report> => {
    const response =
      await api.post(
        '/reports',
        data
      );

    return response.data;
  };

export const rateReport =
  async ({
    reportId,
    rating,
  }: {
    reportId: string;
    rating: ReportRating;
  }) => {
    const response =
      await api.post(
        `/reports/${reportId}/rating`,
        {
          rating,
        }
      );

    return response.data;
  };