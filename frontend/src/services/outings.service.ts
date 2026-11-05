import { api } from '../api/client';

import {
  CreateOutingDTO,
  Outing,
} from '../types/outing';

export const getOutings =
  async (): Promise<Outing[]> => {
    const response =
      await api.get('/planes-salida');

    return response.data;
  };

export const createOuting =
  async (
    data: CreateOutingDTO
  ): Promise<Outing> => {
    const response =
      await api.post(
        '/planes-salida',
        data
      );

    return response.data;
  };
/*
export const getOutingsByZone =
  async (
    zoneId: string
  ): Promise<Outing[]> => {
    const response =
      await api.get(
        `/zones/${zoneId}/outings`
      );

    return response.data;
  };

export const getTrafficByZone =
  async (
    zoneId: string
  ): Promise<TrafficLevel> => {
    const response =
      await api.get(
        `/zones/${zoneId}/traffic`
      );

    return response.data;
  };*/