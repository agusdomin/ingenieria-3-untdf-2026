import { api } from '../api/client';

import {
  CreateObservationDTO,
  Observation,
} from '../types/observation';

export const getObservations =
  async (): Promise<Observation[]> => {
    const response =
      await api.get('/observations');

    return response.data;
  };

export const getObservationsByZone =
  async (
    zoneId: string
  ): Promise<Observation[]> => {
    const response =
      await api.get(
        `/zones/${zoneId}/observations`
      );

    return response.data;
  };

export const createObservation =
  async (
    data: CreateObservationDTO
  ): Promise<Observation> => {
    const response =
      await api.post(
        '/observations',
        data
      );

    return response.data;
  };