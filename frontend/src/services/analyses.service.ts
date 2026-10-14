import { api } from '../api/client';

import {
  Analysis,
  CreateAnalysisDTO,
} from '../types/analysis';

export const getAnalyses =
  async (): Promise<Analysis[]> => {
    const response =
      await api.get('/analyses');

    return response.data;
  };

export const getAnalysis =
  async (
    id: string
  ): Promise<Analysis> => {
    const response =
      await api.get(
        `/analyses/${id}`
      );

    return response.data;
  };

export const createAnalysis =
  async (
    data: CreateAnalysisDTO
  ): Promise<Analysis> => {
    const response =
      await api.post(
        '/analyses',
        data
      );

    return response.data;
  };