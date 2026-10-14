import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '../api/queryKeys';

import {
  getZoneById,
  getZones,
} from '../services/zones.service';

export const useZones = () => {
  return useQuery({
    queryKey: queryKeys.zones.all,
    queryFn: getZones,
  });
};

export const useZone = (
  id: string
) => {
  return useQuery({
    queryKey:
      queryKeys.zones.detail(id),

    queryFn: () =>
      getZoneById(id),

    enabled: Boolean(id),
  });
};