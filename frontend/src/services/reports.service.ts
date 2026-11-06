import { api } from '../api/client';

import {
  CreateReportDTO,
  Report,
  //ReportRating,
} from '../types/report';

export const getReports =
  async (): Promise<Report[]> => {
    const response =
      await api.get('/reportes-tecnicos');

    return response.data;
  };

export const getReport =
  async (
    id: string
  ): Promise<Report> => {
    const response =
      await api.get(
        `/reportes-tecnicos/${id}`
      );

    return response.data;
  };
/*
export const getReportsByZone =
  async (
    zoneId: string
  ): Promise<Report[]> => {
    const response =
      await api.get(
        `/zones/${zoneId}/reports`
      );

    return response.data;
  };*/

export const createReport =
  async (
    data: CreateReportDTO
  ): Promise<Report> => {
    const response =
      await api.post(
        '/reportes-tecnicos',
        data
      );

    return response.data;
  };
