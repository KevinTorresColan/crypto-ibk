import express from 'express';
import cors from 'cors';
import productRoutes from './routes/product.route.js';
import securityRoutes from './routes/security.route.js';
import ecRoutes from './routes/ec.route.js';
import rsaRoutes from './routes/rsa.route.js';
import {
  initializeKeysEC,
  initializeKeysECDER,
  initializeKeysRSA,
  initializeKeysRSADER,
} from './controller/security.controller.js';

// Inicializar claves RSA antes de iniciar el servidor
// initializeKeysRSA();
initializeKeysRSADER();

// Inicializar claves EC antes de iniciar el servidor
initializeKeysEC();
initializeKeysECDER();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware CORS
app.use(cors());

// Middleware para parsear JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use('/api', securityRoutes);
app.use('/api', productRoutes);
app.use('/api', ecRoutes);
app.use('/api', rsaRoutes);

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
