import { Api } from '../utils/api';

export const keyServices = () => {
  const getServerPublicKeyRSA = async () => {
    const res = await Api.get('/public-key-rsa');
    return res.data;
  };

  const getServerPublicKeyEC = async () => {
    const res = await Api.get('/public-key-ec');
    return res.data;
  };

  const getServerPublicKeyECDER = async () => {
    const res = await Api.get('/public-key-ec-der');
    return res.data;
  };

  const getHMacKey = async () => {
    const res = await Api.get('/hmac-secret-key');
    return res.data;
  };

  return {
    getServerPublicKeyRSA,
    getServerPublicKeyEC,
    getServerPublicKeyECDER,
    getHMacKey,
  };
};
