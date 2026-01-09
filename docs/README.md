# ibk-crypto

Librería de criptografía TypeScript para aplicaciones web de Interbank

## Instalación

```bash
npm install ibk-crypto
```

## Uso Básico

```typescript
import { CryptoClient, Mode } from 'ibk-crypto';

// Ejemplo con RSA
const builder = CryptoClient.RSA().builder().withMode(Mode.ENCRYPT);
await builder.withRemotePublicKey(yourPublicKey);
const rsa = await builder.build();
const encrypted = await rsa.encrypt('texto a cifrar');

// Ejemplo con OTEC
const otecBuilder = CryptoClient.OTEC().builder().withMode(Mode.ENCRYPT);
await otecBuilder.withRemotePublicKey(serverPublicKey);
const otec = await otecBuilder.build();
const result = await otec.doFinal('datos a cifrar');

// Ejemplo con EC (Elliptic Curve)
const ecBuilder = CryptoClient.EC().builder().withMode(Mode.ENCRYPT);
await ecBuilder.withRemotePublicKey(remotePublicKey);
const ec = await ecBuilder.build();
const encrypted = await ec.encrypt('datos a cifrar');

// Obtener clave almacenada
const storedKey = CryptoClient.GetKey('nombre-clave');
```

## Características

- 🔐 **Cifrado RSA**: Soporte completo para cifrado asimétrico RSA
- 🔑 **OTEC (One-Time Encryption Cipher)**: Implementación de cifrado de un solo uso
- 📈 **Curvas Elípticas (EC)**: Cifrado basado en criptografía de curva elíptica
- 🎯 **TypeScript**: Completamente tipado para mejor experiencia de desarrollo
- 📦 **Modular**: Importa solo lo que necesites
- ⚡ **Rendimiento**: Optimizado para aplicaciones web modernas
- 🌐 **Compatibilidad**: Funciona en navegadores modernos y Node.js 18+

## Fundamentos Criptográficos

Esta librería está construida sobre la [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API) del navegador y está diseñada para aplicaciones web del lado del cliente.

### RSA (Criptografía Asimétrica)

RSA utiliza un par de claves: una **pública** y una **privada**.

#### Cifrado y Descifrado RSA

- **Cifrado**: Se usa la **clave pública** del destinatario
  - El cliente cifra datos con la clave pública del servidor
  - Solo quien tenga la clave privada correspondiente puede descifrar
- **Descifrado**: Se usa la **clave privada**
  - El servidor (o destinatario) descifra con su clave privada

```typescript
// Cliente cifra con clave pública del servidor → Servidor descifra con su clave privada
```

#### Firma y Verificación RSA

- **Firmar**: Se usa la **clave privada** del firmante
  - Quien firma usa su clave privada para crear la firma digital
  - Demuestra autenticidad e integridad del mensaje
- **Verificar**: Se usa la **clave pública** del firmante
  - Cualquiera con la clave pública puede verificar la firma
  - Confirma que fue firmado por el dueño de la clave privada

```typescript
// Cliente firma con su clave privada → Servidor verifica con la clave pública del cliente
```

### EC (Criptografía de Curva Elíptica)

EC funciona de manera diferente a RSA, usando dos protocolos distintos:

#### ECDH - Cifrado con Acuerdo de Claves

EC utiliza **ECDH (Elliptic Curve Diffie-Hellman)** para establecer un secreto compartido:

1. **Intercambio de Claves Públicas**:
   - Cliente y servidor intercambian sus claves públicas EC
   - Cada uno mantiene su clave privada en secreto

2. **Derivación del Secreto Compartido**:
   - Cliente: usa su clave privada + clave pública del servidor → genera secreto compartido
   - Servidor: usa su clave privada + clave pública del cliente → genera el **mismo** secreto compartido
   - Este secreto es idéntico para ambas partes sin haberlo transmitido

3. **Derivación de Clave AES Simétrica**:
   - Del secreto compartido se deriva una clave **AES** (simétrica)
   - Esta clave AES se usa tanto para **cifrar como descifrar**
   - El cifrado/descifrado real se hace con AES-GCM, no directamente con EC

```typescript
// Ambos lados derivan la misma clave AES simétrica
// Cliente cifra con AES ⟷ Servidor descifra con AES
// Servidor cifra con AES ⟷ Cliente descifra con AES
```

#### ECDSA - Firma Digital

Para firmar se usa **ECDSA (Elliptic Curve Digital Signature Algorithm)**, que requiere un **par de claves diferente**:

- **Firmar**: Se usa la **clave privada ECDSA** del firmante
  - Genera una firma digital del mensaje
- **Verificar**: Se usa la **clave pública ECDSA** del firmante
  - Valida la autenticidad de la firma

```typescript
// Similar a RSA: firma con privada, verifica con pública
// Pero usa un par de claves ECDSA independiente del par ECDH
```

#### OTEC - One-Time Encryption

OTEC es una variante de ECDH optimizada para cifrado de un solo uso:

- Genera un **par de claves efímero** (temporal) en cada operación
- Se comparte solo la clave pública efímera
- Después de `doFinal()`, la instancia no puede reutilizarse
- Ideal para mensajes únicos que requieren forward secrecy

```typescript
// Cada cifrado usa un par de claves nuevo y único
// Mayor seguridad: comprometer una clave no afecta mensajes anteriores
```

### Resumen de Uso de Claves

| Operación     | RSA                  | EC (ECDH)                | EC (ECDSA)           |
| ------------- | -------------------- | ------------------------ | -------------------- |
| **Cifrar**    | Clave pública remota | Secreto compartido → AES | N/A                  |
| **Descifrar** | Clave privada local  | Secreto compartido → AES | N/A                  |
| **Firmar**    | Clave privada local  | N/A                      | Clave privada local  |
| **Verificar** | Clave pública remota | N/A                      | Clave pública remota |

## Métodos Disponibles

### RSA

```typescript
import { CryptoClient, Mode, SignMode } from 'ibk-crypto';

// Cifrado RSA
const builder = CryptoClient.RSA().builder().withMode(Mode.ENCRYPT);
await builder.withRemotePublicKey(publicKey);
const rsa = await builder.build();
const encrypted = await rsa.encrypt('mensaje');

// Descifrado RSA
const decryptBuilder = CryptoClient.RSA().builder().withMode(Mode.DECRYPT);
await decryptBuilder.withRemotePublicKey(publicKey);
const rsaDecrypt = await decryptBuilder.build();
const decrypted = await rsaDecrypt.decrypt(encryptedData);

// Firma digital RSA
const signBuilder = CryptoClient.RSA()
  .builder()
  .withMode(Mode.ENCRYPT)
  .withSignMode(SignMode.SIGN);
const rsaSign = await signBuilder.build();
const signature = await rsaSign.sign(new TextEncoder().encode('mensaje'));

// Verificación de firma RSA
const verifyBuilder = CryptoClient.RSA()
  .builder()
  .withMode(Mode.DECRYPT)
  .withSignMode(SignMode.VERIFY);
await verifyBuilder.withRemoteSignaturePublicKey(publicKey);
const rsaVerify = await verifyBuilder.build();
const isValid = await rsaVerify.verify(
  new TextEncoder().encode('mensaje'),
  signature,
);
```

### OTEC

```typescript
import { CryptoClient, Mode, CipherSuite, ECCurve } from 'ibk-crypto';

// Cifrado de un solo uso con gestión automática de claves efímeras
const builder = CryptoClient.OTEC()
  .builder()
  .withCurve(ECCurve.P256)
  .withCipherSuite(CipherSuite.AES_256_GCM_SHA256)
  .withMode(Mode.ENCRYPT);

// Establecer la clave pública remota
await builder.withRemotePublicKey(serverPublicKey);

// Obtener la clave pública local efímera para compartir
const localPublicKey = await builder.getPublicKey();

// Construir el cifrador y cifrar datos
const otec = await builder.build();
const encrypted = await otec.doFinal('datos a cifrar');

// Descifrado OTEC
const decryptBuilder = CryptoClient.OTEC()
  .builder()
  .withCurve(ECCurve.P256)
  .withCipherSuite(CipherSuite.AES_256_GCM_SHA256)
  .withMode(Mode.DECRYPT);

await decryptBuilder.withRemotePublicKey(ephemeralPublicKey);
const otecDecrypt = await decryptBuilder.build();
const decrypted = await otecDecrypt.doFinal(encryptedData);
```

### EC (Elliptic Curve)

```typescript
import { CryptoClient, Mode, SignMode, CipherSuite, ECCurve } from 'ibk-crypto';

// Cifrado con curvas elípticas (ECDH)
const builder = CryptoClient.EC()
  .builder()
  .withCurve(ECCurve.P256)
  .withCipherSuite(CipherSuite.AES_256_GCM_SHA256)
  .withMode(Mode.ENCRYPT);

await builder.withRemotePublicKey(remotePublicKey);
const ec = await builder.build();
const encrypted = await ec.encrypt('datos a cifrar');

// Firma digital con ECDSA
const signBuilder = CryptoClient.EC()
  .builder()
  .withCurve(ECCurve.P256)
  .withMode(Mode.ENCRYPT)
  .withSignMode(SignMode.SIGN);

const ecSign = await signBuilder.build();
const signature = await ecSign.sign(new TextEncoder().encode('mensaje'));

// Verificación de firma ECDSA
const verifyBuilder = CryptoClient.EC()
  .builder()
  .withCurve(ECCurve.P256)
  .withMode(Mode.DECRYPT)
  .withSignMode(SignMode.VERIFY);

await verifyBuilder.withRemoteSignaturePublicKey(publicKey);
const ecVerify = await verifyBuilder.build();
const isValid = await ecVerify.verify(
  new TextEncoder().encode('mensaje'),
  signature,
);

// Descifrado EC
const decryptBuilder = CryptoClient.EC()
  .builder()
  .withCurve(ECCurve.P256)
  .withCipherSuite(CipherSuite.AES_256_GCM_SHA256)
  .withMode(Mode.DECRYPT);

await decryptBuilder.withRemotePublicKey(remotePublicKey);
const ecDecrypt = await decryptBuilder.build();
const decrypted = await ecDecrypt.decrypt(encryptedData);
```

### Gestión de Claves

```typescript
// Obtener una clave almacenada en memoria
const key = CryptoClient.GetKey('nombre-clave');

// Las claves se almacenan automáticamente al generarse con RSA
// y pueden recuperarse posteriormente usando su nombre
```

## Ejemplos

Revisa la carpeta `demo/` para ver implementaciones completas en:

- **Angular**: [demo/angular](../demo/angular)
- **React**: [demo/reactjs](../demo/reactjs)
- **Vanilla JS**: [demo/vanilla](../demo/vanilla)
- **Backend (Node.js)**: [demo/servidor](../demo/servidor)

## Documentación

- [Arquitectura](./ARCHITECTURE.md) - Estructura y principios de diseño
- [Contribuir](./CONTRIBUTING.md) - Guía para contribuir al proyecto
- [Changelog](./CHANGELOG.md) - Registro de cambios por versión
- [Roadmap](./ROADMAP.md) - Planificación futura
- [Seguridad](./SECURITY.md) - Política de seguridad

## Requisitos

- Node.js >= 18.0.0
- TypeScript >= 5.3.0 (para desarrollo)

## Licencia

MIT

## Soporte

Para reportar bugs o solicitar funcionalidades, consulta la [guía de contribución](./CONTRIBUTING.md).
