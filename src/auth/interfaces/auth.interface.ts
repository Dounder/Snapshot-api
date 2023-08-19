import { User } from './../../users/entities/user.entity';
export interface JwtPayload {
  id: string;
  iat: number;
  exp: number;
}

export interface AuthResponse {
  token: string;
  user: User;
}
