import {
    useMutation,
    useQuery,
    useQueryClient,
  } from '@tanstack/react-query';
  
  import { queryKeys } from '../api/queryKeys';
  
  import {
    createAnalysis,
    getAnalyses,
    getAnalysis,
  } from '../services/analyses.service';
  
  export const useAnalyses =
    () => {
      return useQuery({
        queryKey:
          queryKeys.analyses.all,
  
        queryFn:
          getAnalyses,
      });
    };
  
  export const useAnalysis = (
    id: string
  ) => {
    return useQuery({
      queryKey:
        queryKeys.analyses.detail(id),
  
      queryFn: () =>
        getAnalysis(id),
  
      enabled: Boolean(id),
    });
  };
  
  export const useCreateAnalysis =
    () => {
      const queryClient =
        useQueryClient();
  
      return useMutation({
        mutationFn:
          createAnalysis,
  
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey:
              queryKeys.analyses.all,
          });
        },
      });
    };