export interface UserResponse {

  id: number;
  username: string;

  email: string;

  firstName: string;
  lastName: string;

  phoneNumber: string;

  picture: string | null;

  enabled: boolean;
  deleted: boolean;

  organizationId: number;
  organizationName: string;

  roles: string[];

  createdAt: string;
  updatedAt: string;

}