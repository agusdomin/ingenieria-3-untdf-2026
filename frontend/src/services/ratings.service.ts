import { api } from '../api/client';

import {
  CreateRatingDTO,
  Rating,
} from '../types/rating';

export const createRating =
  async (
    data: CreateRatingDTO
  ): Promise<Rating> => {
    const response =
      await api.post(
        '/valoraciones',
        data
      );

    return response.data;
  };