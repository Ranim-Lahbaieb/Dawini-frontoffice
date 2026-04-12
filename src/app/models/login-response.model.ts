export interface LoginResponse {
  id: number;
  username: string;
  email: string;
  roles: string[];
  message: string;
}