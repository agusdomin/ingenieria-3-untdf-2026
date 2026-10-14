import { api } from '../api/client';

import {
  CreateOutingDTO,
  Outing,
  TrafficLevel,
} from '../types/outing';

export const createOuting =
  async (
    data: CreateOutingDTO
  ): Promise<Outing> => {
    const response =
      await api.post(
        '/outings',
        data
      );

    return response.data;
  };

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
  };