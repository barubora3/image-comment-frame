// atoms/authAtom.ts
import { atomWithStorage } from "jotai/utils";

export type AuthState = {
  fid: number;
  displayName?: string;
  pfpUrl?: string;
  username?: string;
} | null;

export const authAtom = atomWithStorage<AuthState>("authState", null, {
  getItem: (key: string) => {
    const storedValue = localStorage.getItem(key);
    return storedValue ? JSON.parse(storedValue) : null;
  },
  setItem: (key: string, value: AuthState) => {
    localStorage.setItem(key, JSON.stringify(value));
  },
  removeItem: (key: string) => {
    localStorage.removeItem(key);
  },
});
