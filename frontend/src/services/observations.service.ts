
import { api } from '../api/client';

import {
  CreateObservationDTO,
  Observation,
} from '../types/observation';

function getImageMetadata(uri: string) {
  const cleanUri = uri.split(/[?#]/)[0];
  const extension = cleanUri.match(/\.([a-zA-Z0-9]+)$/)?.[1]?.toLowerCase();

  const mimeTypes: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
    heic: 'image/heic',
  };

  const validExtension = extension && mimeTypes[extension]
    ? extension
    : 'jpg';

  return {
    name: `observacion-${Date.now()}.${validExtension}`,
    type: mimeTypes[validExtension],
  };
}

export const getObservations =
  async (): Promise<Observation[]> => {
    const response = await api.get('/observaciones/');
    return response.data;
  };

export const createObservation =
  async (
    data: CreateObservationDTO,
    imageUri?: string | null,
  ): Promise<Observation> => {
    const formData = new FormData();

    formData.append('tipo', data.tipo);
    formData.append('titulo', data.titulo);
    formData.append('descripcion', data.descripcion);
    formData.append(
      'coordenadas',
      JSON.stringify(data.coordenadas),
    );

    if (data.nivel_relevancia !== null) {
      formData.append('nivel_relevancia', data.nivel_relevancia);
    }

    if (data.foto_url) {
      formData.append('foto_url', data.foto_url);
    }

    if (data.fecha_hora) {
      formData.append('fecha_hora', data.fecha_hora);
    }

    if (imageUri) {
      const file = getImageMetadata(imageUri);

      if (typeof document !== 'undefined' && typeof window !== 'undefined') {
        const imageResponse = await fetch(imageUri);
        const imageBlob = await imageResponse.blob();

        formData.append(
          'imagen',
          imageBlob,
          file.name,
        );
      } else {
        formData.append(
          'imagen',
          {
            uri: imageUri,
            name: file.name,
            type: file.type,
          } as unknown as Blob,
        );
      }
    }

    const response = await api.post(
      '/observaciones/',
      formData,
      {
        headers: {
          'Content-Type': undefined,
        },
      },
    );

    return response.data;
  };
