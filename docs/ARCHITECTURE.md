# Arquitectura de `ibk-crypto`

## Estructura de Carpetas

```
📁 docs/
│
├── ARCHITECTURE.md     # Este documento (estructura y principios de diseño)
├── CHANGELOG.md        # Registro de cambios por versión
├── CONTRIBUTING.md     # Guía para contribuir al proyecto
├── README.md           # Descripción general del proyecto
├── ROADMAP.md          # Planificación futura
├── SECURITY.md         # Política de seguridad y reporte de vulnerabilidades
│
📁 demo/            # Ejemplos de implementación
│
├── 📁 angular/         # Implementación en Angular
├── 📁 reactjs/         # Implementación en React
├── 📁 vanilla/         # Implementación en Vanilla JS
├── 📁 servidor/        # Implementación en Node.js (backend)
│
📁 dist/                # Código compilado y exportado
│
📁 src/                 # Código fuente
│
├── 📁 application/     # Capa de aplicación (casos de uso)
│   ├── crypto.application.ts      # Fachada de la aplicación
│   ├── 📁 builders/                # Factories para construcción de ciphers
│   │   ├── ec-cipher.builder.ts
│   │   ├── ec-cipher.factory.ts
│   │   ├── otec-cipher.builder.ts
│   │   ├── otec-cipher.factory.ts
│   │   ├── rsa.builder.ts
│   │   └── rsa.factory.ts
│   ├── 📁 context/                 # Contextos de ejecución
│   │   ├── ec-cipher.context.ts
│   │   └── rsa.context.ts
│   ├── 📁 ports/                   # Interfaces de puertos
│   │   ├── crypto.port.ts
│   │   ├── decrypt.port.ts
│   │   ├── derive-bits.port.ts
│   │   ├── derive-key.port.ts
│   │   ├── digest.port.ts
│   │   ├── encrypt.port.ts
│   │   ├── export-keys.port.ts
│   │   ├── generate-keypair.port.ts
│   │   ├── get-random.port.ts
│   │   ├── import-key.port.ts
│   │   ├── sign.port.ts
│   │   └── verify.port.ts
│   ├── 📁 service/                 # Servicios de aplicación
│   │   ├── 📁 ec/                  # Servicios de curva elíptica
│   │       ├── ec-cipher.service.ts
│   │       ├── otec-cipher.service.ts
│   │   └── 📁 rsa/                 # Servicios RSA
│   │       ├── rsa.service.ts
│   ├── 📁 use-cases/               # Casos de uso específicos
│   │   ├── decrypt.usecase.ts
│   │   ├── derive-bits.usecase.ts
│   │   ├── derive-key.usecase.ts
│   │   ├── digest.usecase.ts
│   │   ├── encrypt.usecase.ts
│   │   ├── export-keys.usecase.ts
│   │   ├── generate-keypair.usecase.ts
│   │   ├── get-random.usecase.ts
│   │   ├── import-key.usecase.ts
│   │   ├── sign.usecase.ts
│   │   ├── verify.usecase.ts
│   └── 📁 utils/                   # Utilidades de aplicación
│
├── 📁 composition-root/            # Inyección de dependencias
│   └── 📁 container/               # Contenedor de DI
│       ├── index.ts                # Exportaciones públicas
│       └── crypto.container.ts     # Configuración del contenedor
│
├── 📁 domain/                      # Capa de dominio
│   ├── 📁 crypto/                  # Entidades y lógica de negocio crypto
│   ├── 📁 repository/              # Interfaces de repositorios
│   │   ├── crypto.repository.ts    # Interfaz para operaciones crypto
│   │   └── key-store.repository.ts # Interfaz para almacenamiento de claves
│   └── 📁 types/                   # Tipos de dominio
│       ├── client.type.ts          # Tipos de cliente
│       ├── ec.types.ts             # Tipos de curvas elípticas
│       └── rsa.types.ts            # Tipos RSA
│
├── 📁 infrastructure/              # Capa de infraestructura
│   └── 📁 adapters/                # Adaptadores de infraestructura
│       ├── 📁 api/                 # Adaptadores de API
│       │   └── crypto.adapter.ts   # Adaptador principal de Crypto
│       ├── 📁 crypto/              # Adaptadores criptográficos
│       │   └── webcrypto.adapter.ts # Implementación con Web Crypto API
│       └── 📁 store/               # Adaptadores de almacenamiento
│           └── memory-keystore.adapter.ts # Almacenamiento en memoria
│
└── 📁 shared/                      # Código compartido
    └── 📁 utils/                   # Utilidades compartidas
```

## Arquitectura en Capas

La librería `ibk-crypto` sigue los principios de **Arquitectura Hexagonal** (Ports & Adapters) y **Clean Architecture**, organizando el código en capas bien definidas:

### 1. **Capa de Dominio** (`domain/`)

Contiene la lógica de negocio pura y las reglas fundamentales de criptografía:

- **Entidades**: Modelos de datos principales
- **Tipos**: Definiciones de tipos de dominio
- **Repositorios**: Interfaces para persistencia de claves

**Principio**: Esta capa NO depende de ninguna otra capa.

### 2. **Capa de Aplicación** (`application/`)

Orquesta los casos de uso y define la lógica de la aplicación:

- **Casos de uso**: Implementan operaciones criptográficas específicas (encrypt, decrypt, sign, verify, etc.)
- **Ports**: Interfaces que definen contratos para las operaciones
- **Services**: Implementaciones de servicios RSA, EC, OTEC
- **Builders**: Factories para construcción de objetos cipher con patrón Builder
- **Context**: Gestión de contextos de ejecución

**Principio**: Depende solo de la capa de dominio.

### 3. **Capa de Infraestructura** (`infrastructure/`)

Implementa los detalles técnicos y adaptadores:

- **Adapters**: Implementaciones concretas de las interfaces de puertos
- Integración con Web Crypto API
- Manejo de formatos de claves (DER)

**Principio**: Depende de las capas de aplicación y dominio.

### 4. **Composition Root** (`composition-root/`)

Punto de entrada para inyección de dependencias:

- **Container**: Configura y conecta todas las dependencias
- Crea instancias de servicios y casos de uso
- Expone la API pública de la librería

## Comunicación entre Capas

### Diagrama de Arquitectura

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USUARIO/APLICACIÓN                          │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ↓
┌─────────────────────────────────────────────────────────────────────┐
│                    COMPOSITION ROOT LAYER                           │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │              CryptoClient (API Pública)                     │    │
│  │  - RSA()    - EC()    - OTEC()    - GetKey()                │    │
│  └──────────────────────────┬──────────────────────────────────┘    │
└─────────────────────────────┼───────────────────────────────────────┘
                              │
                              ↓
┌────────────────────────────────────────────────────────────────────┐
│                    INFRASTRUCTURE LAYER                            │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │               CryptoAdapter (API Adapter)                    │  │
│  └──────────────────────────┬───────────────────────────────────┘  │
└─────────────────────────────┼──────────────────────────────────────┘
                              │
                              ↓
┌────────────────────────────────────────────────────────────────────┐
│                     APPLICATION LAYER                              │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │            CryptoApplication (Fachada)                       │  │
│  └──────────────────┬───────────────────────────────────────────┘  │
│                     │                                              │
│       ┌─────────────┼─────────────┬──────────────────┐             │
│       │             │             │                  │             │
│       ↓             ↓             ↓                  ↓             │
│  ┌─────────┐  ┌──────────┐  ┌─────────┐      ┌──────────┐          │
│  │  RSA    │  │    EC    │  │  OTEC   │      │ KeyStore │          │
│  │ Factory │  │ Factory  │  │ Factory │      │ Manager  │          │
│  └────┬────┘  └────┬─────┘  └────┬────┘      └─────┬────┘          │
│       │            │             │                 │               │
│       ↓            ↓             ↓                 ↓               │
│  ┌─────────┐  ┌──────────┐  ┌─────────┐      ┌──────────┐          │
│  │  RSA    │  │    EC    │  │  OTEC   │      │          │          │
│  │ Context │  │ Context  │  │ Context │      │          │          │
│  └────┬────┘  └────┬─────┘  └────┬────┘      │          │          │
│       │            │             │           │          │          │
│       └────────────┼─────────────┴───────────┘          │          │
│                    │                                    │          │
│       ┌────────────┴─────────────┬──────────────────────┘          │
│       │                          │                                 │
│       ↓                          ↓                                 │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                    USE CASES                                 │  │
│  │  • Encrypt       • Sign          • GenerateKeyPair           │  │
│  │  • Decrypt       • Verify        • ImportKey                 │  │
│  │  • DeriveKey     • Digest        • ExportKeys                │  │
│  │  • DeriveBits    • GetRandom                                 │  │
│  └──────────────────────────┬───────────────────────────────────┘  │
└─────────────────────────────┼──────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              │               │               │
              ↓               ↓               ↓
┌────────────────────────────────────────────────────────────────────┐
│                        DOMAIN LAYER                                │
│  ┌───────────────────────┐  ┌────────────────────────────────────┐ │
│  │    Repositories       │  │          Types & Entities          │ │
│  │  (Interfaces)         │  │                                    │ │
│  │                       │  │  • ECCurve, CipherSuite            │ │
│  │  • CryptoRepository   │  │  • RSAKeyGenParams, RSAOAEPParams  │ │
│  │  • KeyStoreRepository │  │  • SignMode, Mode, HMACMode        │ │
│  └───────────┬───────────┘  │  • ECDSA, ECDH, HMAC               │ │
│              │              └───────────────┬────────────────────┘ │
└──────────────┼─────────────────────────────────────────────────────┘
               │                              ↑
               │  implementa                  │  usa tipos
               │                              │
               ↓                              │
┌────────────────────────────────────────────────────────────────────┐
│                    INFRASTRUCTURE LAYER                            │
│  ┌────────────────────────────────┐  ┌──────────────────────────┐  │
│  │      WebCryptoAdapter          │  │   MemoryKeyStore         │  │
│  │  (Web Crypto API)              │  │   (Almacenamiento)       │  │
│  │                                │  │                          │  │
│  │  • subtle.encrypt()            │  │  • Map<string, Key>      │  │
│  │  • subtle.decrypt()            │  │  • set(key, value)       │  │
│  │  • subtle.sign()               │  │  • get(key)              │  │
│  │  • subtle.verify()             │  │  • delete(key)           │  │
│  │  • subtle.generateKey()        │  │                          │  │
│  │  • subtle.importKey()          │  │                          │  │
│  │  • subtle.exportKey()          │  │                          │  │
│  │  • subtle.deriveKey()          │  │                          │  │
│  │  • subtle.deriveBits()         │  │                          │  │
│  │  • subtle.digest()             │  │                          │  │
│  └────────────────────────────────┘  └──────────────────────────┘  │
└────────────────────────────────────────────────────────────────────┘
```

### Flujo de una Operación de Cifrado

```
1. Usuario llama: CryptoClient.EC().builder()
                         ↓
2. CryptoAdapter → CryptoApplication.EC()
                         ↓
3. CryptoApplication → ECCipherFactory.builder()
                         ↓
4. Factory crea → ECCipherBuilder
                         ↓
5. Usuario configura: .withCurve(P256).withMode(ENCRYPT)
                         ↓
6. Usuario llama: await builder.build()
                         ↓
7. Builder inyecta → ECCipherContext (con use cases)
                         ↓
8. Builder crea → ECCipherService
                         ↓
9. Usuario llama: await cipher.encrypt(data)
                         ↓
10. Service orquesta → Use Cases (ImportKey, DeriveKey, Encrypt)
                         ↓
11. Use Cases llaman → CryptoRepository (WebCryptoAdapter)
                         ↓
12. WebCryptoAdapter → Web Crypto API (subtle.encrypt)
                         ↓
13. Retorna datos cifrados al usuario
```

### Principios de Comunicación

1. **Unidireccional**: Las dependencias fluyen de afuera hacia adentro
   - Infrastructure → Application → Domain
   - Nunca al revés

2. **Inversión de Dependencias**:
   - Las capas superiores dependen de abstracciones (interfaces/ports)
   - Las capas inferiores implementan esas abstracciones

3. **Inyección de Dependencias**:
   - El Composition Root configura todas las dependencias
   - Los objetos reciben sus dependencias por constructor

4. **Separación de Responsabilidades**:
   - Domain: Define QUÉ (reglas de negocio)
   - Application: Define CÓMO (orquestación)
   - Infrastructure: Define CON QUÉ (herramientas)

## Patrones de Diseño

### Builder Pattern

Utilizado para construir objetos cipher complejos:

```typescript
import { CryptoClient, ECCurve, CipherSuite, Mode } from 'ibk-crypto';

// Ejemplo completo de cifrado con EC
const serverPublicKey = 'MFkwEwYHKoZIzj0...'; // Clave pública del servidor

const builder = CryptoClient.EC()
  .builder()
  .withCurve(ECCurve.P256)
  .withCipherSuite(CipherSuite.AES_256_GCM_SHA256)
  .withMode(Mode.ENCRYPT);

// Configurar clave remota
await builder.withRemotePublicKey(serverPublicKey);

// Obtener clave pública local para compartir
const localPublicKey = await builder.getPublicKey();

// Construir cipher y cifrar
const cipher = await builder.build();
const encryptedData = await cipher.encrypt('Mensaje secreto');
```

### Factory Pattern

Para crear instancias de servicios de cifrado:

```typescript
// ECCipherFactory, OTECCipherFactory
```

### Repository Pattern

Para gestión de almacenamiento de claves:

```typescript
import { CryptoClient } from 'ibk-crypto';

// KeyStoreRepository - Almacenamiento en memoria de claves
const key = CryptoClient.GetKey('nombre-clave');
```

### Ports & Adapters (Hexagonal Architecture)

Separación clara entre:

- **Ports**: Interfaces que definen contratos
- **Adapters**: Implementaciones concretas en infraestructura

## Principios de Diseño

### SOLID

- **Single Responsibility**: Cada clase tiene una única responsabilidad
- **Open/Closed**: Abierto para extensión, cerrado para modificación
- **Liskov Substitution**: Los tipos derivados son sustituibles
- **Interface Segregation**: Interfaces específicas por cliente
- **Dependency Inversion**: Dependencias hacia abstracciones

### Clean Code

- Nombres descriptivos y significativos
- Funciones pequeñas con una única responsabilidad
- Comentarios solo cuando sea absolutamente necesario
- Código auto-documentado mediante nombres claros

### Inmutabilidad

- Preferencia por objetos inmutables cuando es posible
- Uso de `readonly` en TypeScript
- Evitar efectos secundarios

## Tooling

- **Bundler**: `tsup` - Empaquetado rápido con soporte ESM/CJS
- **Transpiler**: `TypeScript` - Tipado estático y compilación
- **Linter**: `eslint` + `prettier` - Calidad y formato de código
- **Git Hooks**: `husky` - Validación pre-commit y pre-push
- **Commit Linting**: `commitlint` - Conventional Commits

## Flujo de Datos

```
Usuario/Aplicación
       ↓
CryptoClient (Punto de entrada público)
       ↓
CryptoAdapter (Adaptador de API)
       ↓
CryptoApplication (Fachada de aplicación)
       ↓
Factories (RSAFactory, ECCipherFactory, OTECCipherFactory)
       ↓
Contexts (RSAContext, ECCipherContext)
       ↓
Use Cases (encrypt, decrypt, sign, verify, etc.)
       ↓
Domain Layer (Repositorios, Entidades, Tipos)
       ↓
Infrastructure Adapters
  ├── WebCryptoAdapter (Web Crypto API)
  └── MemoryKeyStore (Almacenamiento de claves)
       ↓
Resultado
```

## Tipos de Operaciones Criptográficas

### RSA (Rivest–Shamir–Adleman)

- Cifrado asimétrico
- Generación de pares de claves
- Firma digital

### EC (Elliptic Curve)

- Cifrado basado en curvas elípticas
- ECDH (Elliptic Curve Diffie-Hellman)
- ECDSA (Elliptic Curve Digital Signature Algorithm)

### OTEC (One-Time Encryption Cipher)

- Cifrado de un solo uso
- Gestión de claves efímeras

### Operaciones Complementarias

- **Digest**: Generación de hashes (SHA-256, SHA-384, SHA-512)
- **Derive Key**: Derivación de claves
- **Derive Bits**: Derivación de bits aleatorios
- **Random**: Generación de valores aleatorios criptográficamente seguros

## Puntos de Entrada

### CryptoClient (API Pública)

El punto de entrada principal de la librería es `CryptoClient`, exportado desde el contenedor de composición:

```typescript
import { CryptoClient } from 'ibk-crypto';

// Acceso a las diferentes implementaciones criptográficas
const rsa = CryptoClient.RSA(); // RSAFactory
const ec = CryptoClient.EC(); // ECCipherFactory
const otec = CryptoClient.OTEC(); // OTECCipherFactory

// Acceso al almacén de claves
const key = CryptoClient.GetKey('nombre-clave');
```

### Arquitectura de Capas Detallada

**Capa de API (Infrastructure/Adapters/API)**

- `CryptoAdapter`: Adaptador que expone la API pública como `CryptoClient`

**Capa de Aplicación (Application)**

- `CryptoApplication`: Fachada que coordina factories y servicios
- Factories: `RSAFactory`, `ECCipherFactory`, `OTECCipherFactory`
- Contexts: `RSAContext`, `ECCipherContext` (inyección de use cases)

**Capa de Casos de Uso (Application/Use-Cases)**

- Implementan operaciones específicas reutilizables
- Orquestan llamadas a repositorios de dominio

**Capa de Dominio (Domain)**

- Repositorios: Interfaces `CryptoRepository`, `KeyStoreRepository`
- Tipos: Definiciones TypeScript para RSA, EC, algoritmos

**Capa de Infraestructura (Infrastructure/Adapters)**

- `WebCryptoAdapter`: Implementa `CryptoRepository` usando Web Crypto API
- `MemoryKeyStore`: Implementa `KeyStoreRepository` con almacenamiento en memoria

## Compatibilidad

- **Navegadores**: Chrome 60+, Firefox 57+, Safari 11+, Edge 79+
- **Node.js**: >= 18.0.0
- **Módulos**: ESM (`.esm.js`) y CommonJS (`.cjs.js`)
- **TypeScript**: Declaraciones de tipos incluidas (`.d.ts`)

## Seguridad

- Uso exclusivo de Web Crypto API (estándar W3C)
- No implementa algoritmos criptográficos propios
- Validación de entradas en todos los casos de uso
- Manejo seguro de errores sin exponer información sensible
- Almacenamiento de claves en memoria (no persistente por defecto)

## Principios Fundamentales

1. **Pureza funcional** donde sea posible
2. **Evitar dependencias innecesarias** - Solo dependencias de desarrollo
3. **API clara y tipada** - TypeScript strict mode
4. **Seguridad por defecto** - Configuraciones seguras predeterminadas
5. **Documentación completa** - Código auto-documentado y ejemplos
6. **Separación de responsabilidades** - Clean Architecture y Hexagonal Architecture

---

_Última actualización: 2 de enero de 2026_
