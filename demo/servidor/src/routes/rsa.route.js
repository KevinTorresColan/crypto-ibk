import { Router } from 'express';
import {
  decrypted,
  decryptedSignature,
  encrypted,
  encryptedAndSign,
  verify,
  signature,
} from '../controller/rsa.controller.js';

const router = Router();

router.post('/decrypted-rsa', decrypted);
router.post('/decrypted-rsa-firma', decryptedSignature);

router.post('/encrypted-rsa', encrypted);
router.post('/encrypted-rsa-verify', encryptedAndSign);

router.post('/verify-rsa', verify);
router.post('/signature-rsa', signature);

export default router;
