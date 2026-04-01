import { invalidateAuthSession } from './authStorage';

export const handleAuthError = (error) => {
  if (error?.status === 401) {
    invalidateAuthSession();
    return true;
  }

  return false;
};
