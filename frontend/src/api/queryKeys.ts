export const queryKeys = {
  observations: {
    all: ["observations"] as const,

    detail: (id: string) => ["observations", id] as const,
  },

  reports: {
    all: ["reports"] as const,

    detail: (id: string) => ["reports", id] as const,
  },

  outings: {
    all: ["outings"] as const,

    detail: (id: string) => ["outings", "detail", id] as const,

    traffic: (
      latitude: number | null,
      longitude: number | null,
      radiusKm: number,
    ) => ["outings", "traffic", latitude, longitude, radiusKm] as const,
  },

  meteorology: {
    current: (latitude: number | null, longitude: number | null) =>
      ["meteorology", "current", latitude, longitude] as const,
  },

  auth: {
    user: ["auth", "user"] as const,
  },
};
