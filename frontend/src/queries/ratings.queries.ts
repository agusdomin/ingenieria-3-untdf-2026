import {
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';

import { queryKeys } from '../api/queryKeys';
import { createRating } from '../services/ratings.service';

export const useCreateRating = () => {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn:
      createRating,

    onSuccess: (rating) => {
      queryClient.invalidateQueries({
        queryKey:
          queryKeys.reports.detail(
            String(rating.reporte_tecnico)
          ),
      });

      queryClient.invalidateQueries({
        queryKey:
          queryKeys.reports.all,
      });
    },
  });
};