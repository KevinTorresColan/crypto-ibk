# Changelog

Todos los cambios significativos a este proyecto serán documentados aquí.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/lang/es/).

## [1.0.0] - 2026-01-01

### Lanzamiento Inicial

Primera versión estable de `ibk-crypto`.

#### Agregado

- ✨ Soporte completo para cifrado RSA
  - Cifrado y descifrado con RSA-OAEP
  - Generación de pares de claves RSA
  - Importación y exportación de claves en múltiples formatos (DER)
- 🔐 Implementación de cifrado con Curvas Elípticas (EC)
  - ECDH (Elliptic Curve Diffie-Hellman) para intercambio de claves
  - ECDSA para firma digital
  - Soporte para curvas P-256, P-384, P-521
- 🔑 Sistema OTEC (One-Time Encryption Cipher)
  - Cifrado de un solo uso
  - Gestión automática de claves efímeras
- 🛠️ Casos de uso criptográficos fundamentales
  - `encrypt`: Cifrado de datos
  - `decrypt`: Descifrado de datos
  - `sign`: Firma digital
  - `verify`: Verificación de firmas
  - `digest`: Generación de hashes (SHA-256, SHA-384, SHA-512)
  - `deriveKey`: Derivación de claves
  - `deriveBits`: Derivación de bits
  - `generateKeyPair`: Generación de pares de claves
  - `importKey`: Importación de claves desde múltiples formatos
  - `exportKey`: Exportación de claves a múltiples formatos
  - `getRandom`: Generación de valores aleatorios criptográficamente seguros

- 📦 Arquitectura modular basada en Clean Architecture
  - Separación en capas: Domain, Application, Infrastructure
  - Patrón Ports & Adapters (Hexagonal Architecture)
  - Inyección de dependencias con Composition Root
- 🏗️ Patrones de diseño implementados
  - Builder Pattern para construcción de ciphers
  - Factory Pattern para creación de servicios
  - Repository Pattern para gestión de claves
- 📚 Ejemplos de implementación incluidos
  - Integración con Angular
  - Integración con React
  - Integración con Vanilla JavaScript
  - Implementación en servidor Node.js
- 🎯 Soporte completo de TypeScript
  - Tipado estricto (`strict: true`)
  - Interfaces bien definidas para todos los puertos
  - Tipos de dominio documentados
- 📦 Distribución en múltiples formatos
  - ESM (ES Modules)
  - CommonJS
  - Declaraciones de tipos TypeScript incluidas
- 🔧 Tooling de desarrollo
  - Bundling optimizado con `tsup`
  - Linting con `eslint` y `prettier`
  - Git hooks con `husky`
  - Validación de commits con `commitlint`

#### Características Técnicas

- **Motor**: Web Crypto API (W3C Standard)
- **Compatibilidad**: Node.js >= 18.0.0
- **Navegadores**: Chrome 60+, Firefox 57+, Safari 11+, Edge 79+
- **Sin dependencias de producción**: Solo dependencias de desarrollo
- **Tamaño optimizado**: Bundle minificado y tree-shakeable

#### Seguridad

- ✅ Uso exclusivo de APIs criptográficas estándar (Web Crypto API)
- ✅ No implementa algoritmos criptográficos propios
- ✅ Validación de entradas
- ✅ Manejo seguro de errores sin exponer información sensible
- ✅ Configuraciones seguras por defecto

#### Documentación

- 📖 **README.md**: Guía de uso completa con ejemplos
- 🏛️ **ARCHITECTURE.md**: Documento de arquitectura detallado
  - Estructura de carpetas completa
  - Patrones de diseño implementados
  - Principios SOLID y Clean Architecture
  - Flujo de datos del sistema
- 🤝 **CONTRIBUTING.md**: Guía de contribución
  - Convenciones de código TypeScript
  - Conventional Commits
  - Proceso de pull requests
- 🗺️ **ROADMAP.md**: Roadmap de características futuras
- 🔒 **SECURITY.md**: Política de seguridad y reporte de vulnerabilidades

#### API Pública

Punto de entrada principal exportado:

```typescript
import { CryptoClient } from 'ibk-crypto';

// Acceso a las diferentes implementaciones
const rsa = CryptoClient.RSA(); // RSAFactory
const ec = CryptoClient.EC(); // ECCipherFactory
const otec = CryptoClient.OTEC(); // OTECCipherFactory

// Almacén de claves en memoria
const key = CryptoClient.GetKey('nombre-clave');
```

---

## Formato de Versiones

### [MAJOR.MINOR.PATCH]

- **MAJOR**: Cambios incompatibles con versiones anteriores (breaking changes)
- **MINOR**: Nueva funcionalidad compatible con versiones anteriores
- **PATCH**: Correcciones de bugs compatibles con versiones anteriores

### Tipos de Cambios

- **Agregado**: Para nuevas funcionalidades
- **Cambiado**: Para cambios en funcionalidad existente
- **Deprecado**: Para funcionalidades que serán removidas
- **Removido**: Para funcionalidades removidas
- **Corregido**: Para corrección de bugs
- **Seguridad**: Para vulnerabilidades de seguridad

---

## Próximas Versiones

Revisa el [ROADMAP](./ROADMAP.md) para ver las características planificadas.
