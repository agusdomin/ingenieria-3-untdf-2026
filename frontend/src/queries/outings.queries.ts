import type {
  TrafficByZoneParams,
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
    //getOutingsByZone,
    getTrafficByZone,
  
  } from '../services/outings.service';
  
  export const useOutings = () => {
  return useQuery({
    queryKey:
      queryKeys.outings.all,
    queryFn:
      getOutings,
  });
};
export const useTrafficByZone = (
  params: TrafficByZoneParams | null
) => {
  return useQuery({
    queryKey: queryKeys.outings.traffic(
      params?.latitude ?? null,
      params?.longitude ?? null,
      params?.radiusKm ?? 5
    ),

    queryFn: () => {
      if (!params) {
        throw new Error('No se proporcionaron coordenadas');
      }

      return getTrafficByZone(params);
    },

    enabled: params !== null,

    staleTime: 1000 * 60,
  });
};



/*
  export const useOutingsByZone =
    (
      zoneId: string
    ) => {
      return useQuery({
        queryKey:
          queryKeys.outings.byZone(
            zoneId
          ),
  
        queryFn: () =>
          getOutingsByZone(
            zoneId
          ),
  
        enabled: Boolean(zoneId),
      });
    };
  
  export const useTrafficByZone =
    (
      zoneId: string
    ) => {
      return useQuery({
        queryKey:
          queryKeys.outings.traffic(
            zoneId
          ),
  
        queryFn: () =>
          getTrafficByZone(
            zoneId
          ),
  
        enabled: Boolean(zoneId),
  
        staleTime:
          1000 * 60,
      });
    };
  */
  export const useCreateOuting = () => {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn:
      createOuting,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey:
          queryKeys.outings.all,
      });
    },
  });
};