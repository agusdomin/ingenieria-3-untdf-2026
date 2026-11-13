
export interface MeteorologyByZoneParams {
  latitude: number;
  longitude: number;
}

export interface MeteorologyResponse {
  id: number;
  latitud: number;
  longitud: number;
  temperatura: number | null;
  precipitaciones: number | null;
  fecha_hora: string;
  nieve_fresca: number | null;
  espesor_nieve: number | null;
  velocidad_viento: number | null;
  direccion_viento: string | null;
  rafaga: number | null;
  humedad: number | null;
}
