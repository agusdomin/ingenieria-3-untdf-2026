import {
  TrafficByAreaParams,
  TrafficByAreaResponse,
  CreateOutingDTO,
  Outing,
} from '../types/outing';
import { api } from '../api/client';

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


export const getTrafficByArea = async (
  params: TrafficByAreaParams
): Promise<TrafficByAreaResponse> => {
  const response =
    await api.get<TrafficByAreaResponse>(
      '/planes-salida/trafico/',
      {
        params: {
          lat: params.latitude,
          lon: params.longitude,
          radio: params.radiusKm ?? 5,
        },
      }
    );

  return response.data;
};