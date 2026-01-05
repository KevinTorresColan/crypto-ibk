/* eslint-disable @typescript-eslint/no-explicit-any */
import { Api } from '../utils/api';

export const ecService = () => {
  const encrypted = async (payload: any) => {
    const response = await Api.post('/encrypted-ec', payload);
    return response.data;
  };

  const getTarjetEncrypted = async (key: any) => {
    const response = await Api.post('/tarjet-ec', key);
    return response.data;
  };

  const messageSignature = async () => {
    const response = await Api.post('/signature-ec');
    return response.data;
  };

  const messageHMACSignature = async () => {
    const response = await Api.post('/signature-ec-hmac');
    return response.data;
  };

  return {
    encrypted,
    getTarjet: getTarjetEncrypted,
    messageSignature,
    messageHMACSignature,
  };
};
