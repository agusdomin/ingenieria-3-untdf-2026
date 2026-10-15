// src/mocks/zones.mock.ts

export const zonesGeoJSON = {
  type: 'FeatureCollection' as const,
  features: [
    {
      type: 'Feature' as const,
      properties: {
        id: 'martial',
        name: 'Glaciar Martial',
        riskLevel: 'considerable',
      },
      geometry: {
        type: 'Polygon' as const,
        coordinates: [
          [
            [-68.42, -54.78],
            [-68.37, -54.78],
            [-68.37, -54.81],
            [-68.42, -54.81],
            [-68.42, -54.78],
          ],
        ],
      },
    },
    {
      type: 'Feature' as const,
      properties: {
        id: 'olum',
        name: 'Valle de Olum',
        riskLevel: 'alto',
      },
      geometry: {
        type: 'Polygon' as const,
        coordinates: [
          [
            [-68.47, -54.73],
            [-68.41, -54.73],
            [-68.41, -54.76],
            [-68.47, -54.76],
            [-68.47, -54.73],
          ],
        ],
      },
    },
    {
      type: 'Feature' as const,
      properties: {
        id: 'esmeralda',
        name: 'Laguna Esmeralda',
        riskLevel: 'bajo',
      },
      geometry: {
        type: 'Polygon' as const,
        coordinates: [
          [
            [-68.14, -54.68],
            [-68.08, -54.68],
            [-68.08, -54.72],
            [-68.14, -54.72],
            [-68.14, -54.68],
          ],
        ],
      },
    },
  ],
};