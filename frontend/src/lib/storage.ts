
import { Preferences } from '@capacitor/preferences';

export const setToken = async (token: string) => {
  await Preferences.set({ key: 'token', value: token });
};

export const getToken = async () => {
  const { value } = await Preferences.get({ key: 'token' });
  return value;
};

export const clearToken = async () => {
  await Preferences.remove({ key: 'token' });
};

// Decode JWT token to get user ID
export const getUserIdFromToken = (token: string): number | null => {
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;

    // Handle base64url decoding properly
    const b64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = b64 + '='.repeat((4 - (b64.length % 4)) % 4);
    const json = decodeURIComponent(
      atob(padded)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const obj = JSON.parse(json);
    const id = Number(obj.userId);
    return Number.isFinite(id) ? id : null;
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};
