export const queryKeys = {
    zones: {
      all: ['zones'] as const,

      detail: (id: string) =>
        ['zones', id] as const,
    },
  
    observations: {
      all: ['observations'] as const,
  
      detail: (id: string) =>
        ['observations', id] as const,
    },
  
    reports: {
      all: ['reports'] as const,
  
      detail: (id: string) =>
        ['reports', id] as const,
    },
  
    outings: {
  all: ['outings'] as const,

  detail: (id: string) =>
    ['outings', 'detail', id] as const,

  traffic: (
    latitude: number | null,
    longitude: number | null,
    radiusKm: number
  ) => [
    'outings',
    'traffic',
    latitude,
    longitude,
    radiusKm,
  ] as const,
},
  
    auth: {
      user: ['auth', 'user'] as const,
    },
  };