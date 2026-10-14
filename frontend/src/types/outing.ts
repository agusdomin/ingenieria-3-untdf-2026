export interface Outing {
    id: string;
  
    zoneId: string;
  
    startTime: string;
  
    expectedReturnTime: string;
  
    peopleCount: number;
  
    createdBy: string;
  }
  
  export interface CreateOutingDTO {
    zoneId: string;
  
    startTime: string;
  
    expectedReturnTime: string;
  
    peopleCount: number;
  }
  
  export interface TrafficLevel {
    zoneId: string;
  
    level:
      | 'bajo'
      | 'medio'
      | 'alto';
  
    activeOutings: number;
  
    peopleCount: number;
  }