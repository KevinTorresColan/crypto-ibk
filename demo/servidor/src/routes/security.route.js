import { Router } from 'express';
import {
  getPublicKeyEC,
  getPublicKeyECDER,
  getPublicKeyRSA,
  getHMACSecretKey,
} from '../controller/security.controller.js';

const router = Router();

router.get('/public-key-rsa', getPublicKeyRSA);
router.get('/public-key-ec', getPublicKeyEC);
router.get('/public-key-ec-der', getPublicKeyECDER);
router.get('/hmac-secret-key', getHMACSecretKey);

export default router;
