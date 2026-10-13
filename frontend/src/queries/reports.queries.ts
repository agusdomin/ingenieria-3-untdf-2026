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
    getReportsByZone,
    rateReport,
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
  
  export const useReportsByZone =
    (
      zoneId: string
    ) => {
      return useQuery({
        queryKey:
          queryKeys.reports.byZone(
            zoneId
          ),
  
        queryFn: () =>
          getReportsByZone(
            zoneId
          ),
  
        enabled: Boolean(zoneId),
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
  
          queryClient.invalidateQueries({
            queryKey:
              queryKeys.reports.byZone(
                report.zoneId
              ),
          });
  
          queryClient.invalidateQueries({
            queryKey:
              queryKeys.analyses.all,
          });
        },
      });
    };
  
  export const useRateReport =
    () => {
      const queryClient =
        useQueryClient();
  
      return useMutation({
        mutationFn:
          rateReport,
  
        onSuccess: (
          _,
          variables
        ) => {
          queryClient.invalidateQueries({
            queryKey:
              queryKeys.reports.detail(
                variables.reportId
              ),
          });
        },
      });
    };