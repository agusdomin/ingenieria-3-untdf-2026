import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { queryKeys } from '../api/queryKeys';

import {
  createObservation,
  getObservations,
} from '../services/observations.service';

export const useObservations = (enabled = true) => {
  return useQuery({
    queryKey: queryKeys.observations.all,
    queryFn: getObservations,
    enabled,
  });
};

export const useCreateObservation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createObservation,

    onSuccess: (observation) => {
      queryClient.setQueryData<import('../types/observation').Observation[]>(
        queryKeys.observations.all,
        (current) => current ? [observation, ...current.filter((item) => item.id !== observation.id)] : undefined,
      );
      return queryClient.invalidateQueries({
        queryKey: queryKeys.observations.all,
      });
    },
  });
};
