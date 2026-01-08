import { Router } from 'express';
import {
  getAllProducts,
  createProductEncryptedRSA,
  createProductEncryptedRSADER,
  createProductEncryptedRSAFirma,
  createProductEncryptedRSADERFirma,
  createProductEncryptedEC,
  createProductEncryptedECFirma,
  createProductEncryptedECDER,
  getTarjetEncryptedAndSend,
} from '../controller/product.controller.js';

const router = Router();

// Obtener todos los productos
router.get('/productos', getAllProducts);

// nuevo endpoint seguro
router.post('/productos/encrypted-rsa', createProductEncryptedRSA);
router.post('/productos/encrypted-rsa-der', createProductEncryptedRSADER);

router.post('/productos/encrypted-rsa-firma', createProductEncryptedRSAFirma);
router.post(
  '/productos/encrypted-rsa-der-firma',
  createProductEncryptedRSADERFirma,
);

router.post('/productos/encrypted-ec', createProductEncryptedEC);
router.post('/productos/encrypted-ec-der', createProductEncryptedECDER);

router.post('/productos/encrypted-ec-firma', createProductEncryptedECFirma);

router.post('/tarjet', getTarjetEncryptedAndSend);

export default router;
