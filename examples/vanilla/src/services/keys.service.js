import { fetchAPI } from '../utils/api.js';

export const keysService = {
  async getServerPublicKeyRSA() {
    return await fetchAPI('/public-key-rsa');
  },

  async getServerPublicKeyRSADER() {
    return await fetchAPI('/public-key-rsa-der');
  },

  async getServerPublicKeyEC() {
    return await fetchAPI('/public-key-ec');
  },

  async getServerPublicKeyECDER() {
    return await fetchAPI('/public-key-ec-der');
  },

  async getHMacKey() {
    return await fetchAPI('/hmac-secret-key');
  },
};
