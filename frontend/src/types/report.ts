export interface ReportCoordinates {
  latitude: number;
  longitude: number;
}

export interface Terreno {
  ubicacion_gps?: string;
  altitud?: number | null;
  orientacion_ladera?: string;
  inclinacion_pendiente?: number | null;
  forma_del_terreno?: string;
}

export interface EstadoNieve {
  espesor_total_manto?: number | null;
  nieve_nueva_24h?: number | null;
  hundimiento_pie?: number | null;
  hundimiento_esqui?: number | null;
}

export interface CapaDebil {
  profundidad_capa_debil?: number | null;
  grosor_capa_debil?: number | null;
  dureza_de_la_nieve?: string;
  tipo_de_grano?: string;
  tamano_de_cristal?: number | null;
  cantidad_de_limones?: number | null;
}

export interface PruebasEstabilidad {
  test_compresion_ct?: string;
  test_columna_extendida_ect?: string;
  test_sierra_pst?: string;
  calidad_de_deslizamiento_q?: string;
}

export interface ClimaLocal {
  temperatura_ambiente?: number | null;
  temperatura_superficie_nieve?: number | null;
  estado_del_cielo?: string;
  fuerza_del_viento?: string;
  direccion_del_viento?: string;
  tipo_de_precipitacion?: string;
}

export interface SenalesAlarma {
  sonidos_de_colapso_whumpfs?: boolean;
  grietas_en_superficie?: boolean;
  avalanchas_recientes?: string;
}

export interface DatosCampo {
  terreno?: Terreno;
  estado_nieve?: EstadoNieve;
  capa_debil?: CapaDebil;
  pruebas_estabilidad?: PruebasEstabilidad;
  clima_local?: ClimaLocal;
  senales_alarma?: SenalesAlarma;
}

export interface Report {
  id: number;

  usuario: number;
  usuario_nombre: string;

  fecha_hora: string;

  nivel_peligro_estimado: string | null;
  diagnostico_resumen: string | null;

  datos_campo: DatosCampo | null;

  datos_meteorologicos: number | null;

  coordenadas: ReportCoordinates | null;
}

export interface CreateReportDTO {
  fecha_hora?: string;

  nivel_peligro_estimado?: string;
  diagnostico_resumen?: string;

  datos_campo?: DatosCampo;

  datos_meteorologicos?: number;

  coordenadas?: ReportCoordinates;
}