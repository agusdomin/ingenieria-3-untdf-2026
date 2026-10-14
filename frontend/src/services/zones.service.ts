import { api } from '../api/client';

import { Zone } from '../types/zone';

export const getZones =
  async (): Promise<Zone[]> => {
    const response = await api.get('/zones');

    return response.data;
  };

export const getZoneById = async (
  id: string
): Promise<Zone> => {
  const response = await api.get(
    `/zones/${id}`
  );

  return response.data;
};