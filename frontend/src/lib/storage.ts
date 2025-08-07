
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
