import { createContext, useContext } from 'react';

export interface IAuthContext {
  signIn: () => void;
  signOut: () => void;
  user: User | null;
  setUser: (user: User) => void;
  signInAs: (userId: number) => void;
  authError: string | null;
  isAuthenticating: boolean;
}

export const AuthContext = createContext<IAuthContext>({
  signIn: () => {},
  signOut: () => {},
  user: null,
  setUser: () => {},
  signInAs: () => {},
  authError: null,
  isAuthenticating: false,
});

export const useAuth = () => useContext(AuthContext);
