
import { api } from '../api/client';

import type {
  MeteorologyByLocationParams,
  MeteorologyResponse,
} from '../types/meteorology';

export const getCurrentMeteorology = async (
  params: MeteorologyByLocationParams
): Promise<MeteorologyResponse> => {
  const response = await api.get<MeteorologyResponse>(
    '/datos-meteorologicos/actual/',
    {
      params: {
        lat: params.latitude,
        lon: params.longitude,
      },
    }
  );

  return response.data;
};
