declare module './authStorage' {
  export const getToken: () => string | null;
  export const setToken: (token: string) => void;
  export const removeToken: () => void;
  export const getRefreshToken: () => string | null;
  export const setRefreshToken: (token: string) => void;
  export const removeRefreshToken: () => void;
  export const getUser: () => any | null;
  export const setUser: (user: any) => void;
  export const removeUser: () => void;
  export const clearAuthData: () => void;
  export const isAuthenticated: () => boolean;
  export const setAuthData: (data: {
    token: string;
    refreshToken?: string;
    user: any;
  }) => void;
}
