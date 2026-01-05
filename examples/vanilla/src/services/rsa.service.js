import { fetchAPI } from '../utils/api.js';

export const rsaService = {
  async encryptedPEM(ciphertext) {
    const response = await fetchAPI('/decrypted-rsa', {
      method: 'POST',
      body: JSON.stringify({ ciphertext }),
    });
    return response;
  },

  async encryptedDER(ciphertext) {
    const response = await fetchAPI('/decrypted-rsa-der', {
      method: 'POST',
      body: JSON.stringify({ ciphertext }),
    });
    return response;
  },

  async encryptedPEMFirma(payload) {
    const response = await fetchAPI('/decrypted-rsa-firma', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return response;
  },

  async encryptedDERFirma(payload) {
    const response = await fetchAPI('/decrypted-rsa-der-firma', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return response;
  },

  async encrypted(ciphertext) {
    const response = await fetchAPI('/decrypted-rsa', {
      method: 'POST',
      body: JSON.stringify({ ciphertext }),
    });
    return response;
  },

  async encryptedFirma(payload) {
    const response = await fetchAPI('/decrypted-rsa-firma', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return response;
  },

  async getTarjet(publicKey) {
    const response = await fetchAPI('/encrypted-rsa', {
      method: 'POST',
      body: JSON.stringify({ publicKey }),
    });
    return response;
  },

  async getTarjetAndVerify(publicKey) {
    const response = await fetchAPI('/encrypted-rsa-verify', {
      method: 'POST',
      body: JSON.stringify({ publicKey }),
    });
    return response;
  },

  async verify(payload) {
    const response = await fetchAPI('/verify-rsa', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return response;
  },

  async signature(cardNumber) {
    const response = await fetchAPI('/signature-rsa', {
      method: 'POST',
      body: JSON.stringify({ cardNumber }),
    });
    return response;
  },
};
