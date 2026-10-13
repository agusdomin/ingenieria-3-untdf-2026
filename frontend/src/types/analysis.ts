export interface Analysis {
    id: string;
  
    zoneId: string;
    zoneName: string;
  
    date: string;
  
    newSnowCm?: number;
  
    snowpackDepthCm?: number;
  
    weakLayerDepthCm?: number;
  
    notes?: string;
  
    createdBy: string;
  
    reportGenerated: boolean;
  }
  
  export interface CreateAnalysisDTO {
    zoneId: string;
  
    newSnowCm?: number;
  
    snowpackDepthCm?: number;
  
    weakLayerDepthCm?: number;
  
    notes?: string;
  }