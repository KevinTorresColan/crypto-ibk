import { fetchAPI } from '../utils/api.js';

export const ecService = {
  async encrypted(payload) {
    const response = await fetchAPI('/encrypted-ec', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return response;
  },

  async getTarjet(key) {
    const response = await fetchAPI('/tarjet-ec', {
      method: 'POST',
      body: JSON.stringify(key),
    });
    return response;
  },

  async messageSignature() {
    const response = await fetchAPI('/signature-ec', {
      method: 'POST',
      body: JSON.stringify({}),
    });
    return response;
  },

  async messageHMACSignature() {
    const response = await fetchAPI('/signature-ec-hmac', {
      method: 'POST',
      body: JSON.stringify({}),
    });
    return response;
  },
};
