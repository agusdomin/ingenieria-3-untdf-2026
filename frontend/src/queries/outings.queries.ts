import type {
  TrafficByAreaParams,
} from '../types/outing';

import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { queryKeys } from '../api/queryKeys';

import {
  createOuting,
  getOutings,
  getTrafficByArea,
} from '../services/outings.service';

export const useOutings = () => {
  return useQuery({
    queryKey: queryKeys.outings.all,
    queryFn: getOutings,
  });
};

export const useTrafficByArea = (
  params: TrafficByAreaParams | null
) => {
  return useQuery({
    queryKey: queryKeys.outings.traffic(
      params?.latitude ?? null,
      params?.longitude ?? null,
      params?.radiusKm ?? 5
    ),

    queryFn: () => {
      if (!params) {
        throw new Error(
          'No se proporcionaron coordenadas'
        );
      }

      return getTrafficByArea(params);
    },

    enabled: params !== null,
    staleTime: 1000 * 60,
  });
};

export const useCreateOuting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createOuting,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.outings.all,
      });
    },
  });
};