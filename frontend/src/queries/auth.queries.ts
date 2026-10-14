import {
    useMutation,
    useQuery,
    useQueryClient,
  } from '@tanstack/react-query';
  
  import { queryKeys } from '../api/queryKeys';
  
  import {
    getCurrentUser,
    login,
    logout,
    register,
  } from '../services/auth.service';
  
  export const useCurrentUser =
    () => {
      return useQuery({
        queryKey:
          queryKeys.auth.user,
  
        queryFn:
          getCurrentUser,
  
        retry: false,
      });
    };
  
  export const useLogin =
    () => {
      const queryClient =
        useQueryClient();
  
      return useMutation({
        mutationFn:
          login,
  
        onSuccess: (
          auth
        ) => {
          queryClient.setQueryData(
            queryKeys.auth.user,
            auth.user
          );
        },
      });
    };
  
  export const useRegister =
    () => {
      return useMutation({
        mutationFn:
          register,
      });
    };
  
  export const useLogout =
    () => {
      const queryClient =
        useQueryClient();
  
      return useMutation({
        mutationFn:
          logout,
  
        onSuccess: () => {
          queryClient.clear();
        },
      });
    };