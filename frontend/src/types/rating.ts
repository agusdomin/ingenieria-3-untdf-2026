export interface Rating {
  id: number;

  usuario: number;
  usuario_nombre: string;

  reporte_tecnico: number;

  calificacion: string;

  comentario: string | null;

  fecha_hora: string;
}

export interface CreateRatingDTO {
  reporte_tecnico: number;
  calificacion: string;
  comentario?: string;
}