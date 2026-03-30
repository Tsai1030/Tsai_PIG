export type UserRole = "her" | "him";

export interface LoginRequest {
  nickname: string;
  password: string;
}

export interface LoginResponse {
  role: UserRole;
  nickname: string;
}

export interface MeResponse {
  role: UserRole;
  nickname: string;
}

export interface AuthState {
  role: UserRole | null;
  nickname: string | null;
  isLoggedIn: boolean;
  isLoading: boolean;
}
