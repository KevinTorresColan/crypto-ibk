# ibk-crypto

[![npm version](https://badge.fury.io/js/ibk-crypto.svg)](https://badge.fury.io/js/ibk-crypto)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)

Librería de criptografía TypeScript robusta y segura para aplicaciones web, construida sobre la Web Crypto API con soporte para RSA, curvas elípticas (EC) y cifrado OTEC.

## 🚀 Instalación

```bash
npm install ibk-crypto
```

## ✨ Características

- 🔐 **Cifrado RSA**: Soporte completo para cifrado/descifrado y firma/verificación
- 🔑 **OTEC (One-Time Encryption Cipher)**: Implementación de cifrado de un solo uso
- 📈 **Curvas Elípticas (EC)**: Cifrado ECDH con derivación de claves AES
- 🎯 **TypeScript**: Completamente tipado para mejor experiencia de desarrollo
- 📦 **Modular**: Arquitectura limpia con patrón builder
- ⚡ **Rendimiento**: Optimizado para aplicaciones web modernas
- 🌐 **Compatibilidad**: Funciona en navegadores modernos y Node.js 18+
- 🛡️ **Seguro**: Construido sobre Web Crypto API estándar del navegador

## 📖 Uso Básico

### Cifrado RSA

```typescript
import { CryptoClient, Mode } from 'ibk-crypto';

// Cifrado con clave pública
const builder = CryptoClient.RSA().builder().withMode(Mode.ENCRYPT);
await builder.withRemotePublicKey(publicKeyData);
const rsa = await builder.build();
const encrypted = await rsa.encrypt('texto a cifrar');

// Descifrado con clave privada
const decryptBuilder = CryptoClient.RSA().builder().withMode(Mode.DECRYPT);
await decryptBuilder.withPrivateKey(privateKeyData);
const rsaDecrypt = await decryptBuilder.build();
const decrypted = await rsaDecrypt.decrypt(encrypted);
```

### Cifrado con Curvas Elípticas (EC)

```typescript
// Cifrado EC con ECDH
const ecBuilder = CryptoClient.EC().builder().withMode(Mode.ENCRYPT);
await ecBuilder.withRemotePublicKey(remotePublicKey);
const ec = await ecBuilder.build();
const encrypted = await ec.encrypt('datos a cifrar');

// Descifrado EC
const decryptBuilder = CryptoClient.EC().builder().withMode(Mode.DECRYPT);
await decryptBuilder.withPrivateKey(privateKey);
const ecDecrypt = await decryptBuilder.build();
const decrypted = await ecDecrypt.decrypt(encrypted);
```

### OTEC (One-Time Encryption Cipher)

```typescript
// Cifrado OTEC
const otecBuilder = CryptoClient.OTEC().builder().withMode(Mode.ENCRYPT);
await otecBuilder.withRemotePublicKey(serverPublicKey);
const otec = await otecBuilder.build();
const result = await otec.doFinal('datos a cifrar');
```

### Gestión de Claves

```typescript
// Obtener clave almacenada
const storedKey = CryptoClient.GetKey('nombre-clave');

// Generar par de claves RSA
const keyPair = await CryptoClient.RSA().generateKeyPair();

// Generar par de claves EC
const ecKeyPair = await CryptoClient.EC().generateKeyPair();
```

## 📁 Estructura del Proyecto

```
src/
├── application/         # Casos de uso y lógica de aplicación
│   ├── builders/       # Patrones builder para diferentes algoritmos
│   ├── context/        # Contextos de cifrado
│   ├── ports/          # Interfaces y contratos
│   ├── service/        # Servicios de dominio
│   └── use-cases/      # Casos de uso específicos
├── domain/             # Entidades y lógica de dominio
├── infrastructure/     # Adaptadores e implementaciones concretas
└── shared/            # Utilidades compartidas
```

## 🔧 Desarrollo

### Requisitos

- Node.js ≥ 18.0.0
- npm o yarn

### Scripts Disponibles

```bash
# Compilar la librería
npm run build

# Desarrollo con watch mode
npm run dev

# Linting
npm run lint
npm run lint:fix

# Formateo de código
npm run prettier
```

## 📚 Ejemplos

El proyecto incluye ejemplos completos para diferentes frameworks:

- **[Angular](demo/angular/)**: Integración con Angular 15+
- **[React](demo/reactjs/)**: Implementación con React y Vite
- **[Vanilla JavaScript](demo/vanilla/)**: Uso básico sin frameworks
- **[Servidor Node.js](demo/servidor/)**: Ejemplos del lado del servidor

### Ejecutar Ejemplos

```bash
# Angular
cd demo/angular && npm install && npm start

# React
cd demo/reactjs && npm install && npm run dev

# Vanilla
cd demo/vanilla && npm install && npm run dev

# Servidor
cd demo/servidor && npm install && npm start
```

## 🛡️ Fundamentos Criptográficos

### RSA (Criptografía Asimétrica)

- **Cifrado**: Utiliza clave pública del destinatario
- **Descifrado**: Utiliza clave privada del destinatario
- **Firma**: Utiliza clave privada del firmante
- **Verificación**: Utiliza clave pública del firmante

### EC (Criptografía de Curva Elíptica)

- **ECDH**: Intercambio seguro de claves
- **Derivación**: Genera secreto compartido sin transmitirlo
- **AES**: Deriva claves simétricas para cifrado/descifrado

### OTEC (One-Time Encryption Cipher)

- **Uso único**: Claves que se usan una sola vez
- **Seguridad**: Máxima seguridad para datos sensibles

## 📄 Documentación

- [Documentación completa](docs/README.md)
- [Arquitectura del proyecto](docs/ARCHITECTURE.md)
- [Guía de contribución](docs/CONTRIBUTING.md)
- [Changelog](docs/CHANGELOG.md)
- [Roadmap](docs/ROADMAP.md)
- [Seguridad](docs/SECURITY.md)

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! Por favor:

1. Fork el repositorio
2. Crea una rama feature (`git checkout -b feature/nueva-caracteristica`)
3. Commit tus cambios (`git commit -am 'Agregar nueva característica'`)
4. Push a la rama (`git push origin feature/nueva-caracteristica`)
5. Abre un Pull Request

Lee nuestra [Guía de Contribución](docs/CONTRIBUTING.md) para más detalles.

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.

## 🏢 Autor

Desarrollado para aplicaciones web de Interbank.

---
