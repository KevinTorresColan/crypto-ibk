import { Router } from 'express';
import {
  desencryptAndVerify,
  EncryptedAndVerifySendTarjet,
  signMessage,
  signHMACMessage,
} from '../controller/ec.controller.js';

const router = Router();

router.post('/encrypted-ec', desencryptAndVerify);
router.post('/tarjet-ec', EncryptedAndVerifySendTarjet);
router.post('/signature-ec', signMessage);
router.post('/signature-ec-hmac', signHMACMessage);

export default router;
