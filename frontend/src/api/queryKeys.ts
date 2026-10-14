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
  
      byZone: (zoneId: string) =>
        ['observations', 'zone', zoneId] as const,
    },
  
    reports: {
      all: ['reports'] as const,
  
      detail: (id: string) =>
        ['reports', id] as const,
  
      byZone: (zoneId: string) =>
        ['reports', 'zone', zoneId] as const,
    },
  
    analyses: {
      all: ['analyses'] as const,
  
      detail: (id: string) =>
        ['analyses', id] as const,
    },
  
    outings: {
      all: ['outings'] as const,
  
      byZone: (zoneId: string) =>
        ['outings', 'zone', zoneId] as const,
  
      traffic: (zoneId: string) =>
        ['traffic', zoneId] as const,
    },
  
    auth: {
      user: ['auth', 'user'] as const,
    },
  };