export type UserRole = "her" | "him";

export interface LoginRequest {
  nickname: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  role: UserRole;
  nickname: string;
}

export interface AuthState {
  token: string | null;
  role: UserRole | null;
  nickname: string | null;
  isLoggedIn: boolean;
}
