
import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '../api/queryKeys';

import { getCurrentMeteorology } from '../services/meteorology.service';

import type {
  MeteorologyByZoneParams,
} from '../types/meteorology';

export const useCurrentMeteorology = (
  params: MeteorologyByZoneParams | null
) => {
  return useQuery({
    queryKey: queryKeys.meteorology.current(
      params?.latitude ?? null,
      params?.longitude ?? null
    ),

    queryFn: () => {
      if (!params) {
        throw new Error('No se proporcionaron coordenadas');
      }

      return getCurrentMeteorology(params);
    },

    enabled: params !== null,

    staleTime: 1000 * 60 * 60,
  });
};
