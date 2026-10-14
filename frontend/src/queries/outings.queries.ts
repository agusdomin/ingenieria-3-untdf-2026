import {
    useMutation,
    useQuery,
    useQueryClient,
  } from '@tanstack/react-query';
  
  import { queryKeys } from '../api/queryKeys';
  
  import {
    createOuting,
    getOutingsByZone,
    getTrafficByZone,
  } from '../services/outings.service';
  
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
  
  export const useCreateOuting =
    () => {
      const queryClient =
        useQueryClient();
  
      return useMutation({
        mutationFn:
          createOuting,
  
        onSuccess: (
          outing
        ) => {
          queryClient.invalidateQueries({
            queryKey:
              queryKeys.outings.byZone(
                outing.zoneId
              ),
          });
  
          queryClient.invalidateQueries({
            queryKey:
              queryKeys.outings.traffic(
                outing.zoneId
              ),
          });
        },
      });
    };