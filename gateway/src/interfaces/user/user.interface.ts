export interface IUser {
  id: string;
  email: string;
  is_confirmed: boolean;
  accessToken?: string;
  refreshToken?: string;
}
