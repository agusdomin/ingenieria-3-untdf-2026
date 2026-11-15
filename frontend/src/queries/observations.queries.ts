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

export const useObservations = () => {
  return useQuery({
    queryKey: queryKeys.observations.all,
    queryFn: getObservations,
  });
};

export const useCreateObservation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createObservation,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.observations.all,
      });
    },
  });
};