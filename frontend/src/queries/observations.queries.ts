import {
    useMutation,
    useQuery,
    useQueryClient,
  } from '@tanstack/react-query';
  
  import { queryKeys } from '../api/queryKeys';
  
  import {
    createObservation,
    getObservations,
    getObservationsByZone,
  } from '../services/observations.service';
  
  export const useObservations =
    () => {
      return useQuery({
        queryKey:
          queryKeys.observations.all,
  
        queryFn:
          getObservations,
      });
    };
  
  export const useObservationsByZone =
    (
      zoneId: string
    ) => {
      return useQuery({
        queryKey:
          queryKeys.observations.byZone(
            zoneId
          ),
  
        queryFn: () =>
          getObservationsByZone(
            zoneId
          ),
  
        enabled: Boolean(zoneId),
      });
    };
  
  export const useCreateObservation =
    () => {
      const queryClient =
        useQueryClient();
  
      return useMutation({
        mutationFn:
          createObservation,
  
        onSuccess: (
          observation
        ) => {
          queryClient.invalidateQueries({
            queryKey:
              queryKeys.observations.all,
          });
  
          queryClient.invalidateQueries({
            queryKey:
              queryKeys.observations.byZone(
                observation.zoneId
              ),
          });
        },
      });
    };