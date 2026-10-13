export interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  
    role:
      | 'observador_recreativo'
      | 'observador_experto'
      | 'administrador';
  }
  
  export interface LoginDTO {
    email: string;
    password: string;
  }
  
  export interface RegisterDTO {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }
  
  export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    user: User;
  }