import { Api } from '../utils/api';

export const RSAService = () => {
  const encrypted = async (ciphertext: string) => {
    const response = await Api.post('/decrypted-rsa', { ciphertext });
    return response.data;
  };

  const encryptedFirma = async ({
    ciphertext,
    signature,
    clientPublicKey,
  }: {
    ciphertext: string;
    signature: string;
    clientPublicKey: string;
  }) => {
    const response = await Api.post('/decrypted-rsa-firma', {
      ciphertext,
      signature,
      clientPublicKey,
    });
    return response.data;
  };

  const getTarjet = async (publicKey: string) => {
    const response = await Api.post('/encrypted-rsa', { publicKey });
    return response.data;
  };

  const getTarjetAndVerify = async (publicKey: string) => {
    const response = await Api.post('/encrypted-rsa-verify', { publicKey });
    return response.data;
  };

  const verify = async ({
    cardNumber,
    signature,
    publicKey,
  }: {
    cardNumber: string;
    signature: string;
    publicKey: string;
  }) => {
    const response = await Api.post('/verify-rsa', {
      cardNumber,
      signature,
      publicKey,
    });
    return response.data;
  };

  const signature = async (cardNumber: string) => {
    const response = await Api.post('/signature-rsa', { cardNumber });
    return response.data;
  };

  return {
    encrypted,
    encryptedFirma,
    getTarjet,
    getTarjetAndVerify,
    verify,
    signature,
  };
};
