export interface UserRequest {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  picture: string | null;
  organizationId: number;
  role: string;
  enabled?: boolean;
}