import {
    useMutation,
    useQuery,
    useQueryClient,
  } from '@tanstack/react-query';
  
  import { queryKeys } from '../api/queryKeys';
  
  import {
    createReport,
    getReport,
    getReports,
  } from '../services/reports.service';
  
  export const useReports =
    () => {
      return useQuery({
        queryKey:
          queryKeys.reports.all,
  
        queryFn:
          getReports,
      });
    };
  
  export const useReport = (
    id: string
  ) => {
    return useQuery({
      queryKey:
        queryKeys.reports.detail(id),
  
      queryFn: () =>
        getReport(id),
  
      enabled: Boolean(id),
    });
  };
  
  export const useCreateReport =
    () => {
      const queryClient =
        useQueryClient();
  
      return useMutation({
        mutationFn:
          createReport,
  
        onSuccess: (
          report
        ) => {
          queryClient.invalidateQueries({
            queryKey:
              queryKeys.reports.all,
          });
        },
      });
    };
 