// ============================================================
// Elliptic Curve Algorithm Types for Web Crypto API
// ============================================================

/**
 * Supported named curves for ECDH and ECDSA
 * Web Crypto API supports only these curves for EC
 */
export type ECNamedCurve = 'P-256' | 'P-384' | 'P-521';

/**
 * Hash algorithms supported for ECDSA
 */
export type ECDSAHashAlgorithm = 'SHA-256' | 'SHA-384' | 'SHA-512';

// ============================================================
// EC Algorithm Configuration Types
// ============================================================

/**
 * ECDH (Elliptic Curve Diffie-Hellman) algorithm configuration
 *
 * ECDH is a key agreement protocol that allows two parties to establish
 * a shared secret over an insecure channel using elliptic curve cryptography.
 *
 * @property {"ECDH"} name - Algorithm identifier for ECDH key agreement
 * @property {ECNamedCurve} namedCurve - Named elliptic curve to use (P-256, P-384, or P-521)
 */
export interface ECDHAlgorithm {
  name: 'ECDH';
  namedCurve: ECNamedCurve;
}

/**
 * ECDSA (Elliptic Curve Digital Signature Algorithm) configuration
 *
 * ECDSA is a digital signature algorithm that uses elliptic curve cryptography
 * to create and verify signatures, providing authentication and non-repudiation.
 *
 * @property {"ECDSA"} name - Algorithm identifier for ECDSA signatures
 * @property {ECNamedCurve} namedCurve - Named elliptic curve to use (P-256, P-384, or P-521)
 * @property {ECDSAHashAlgorithm} hash - Hash algorithm for signature generation (SHA-256, SHA-384, or SHA-512)
 */
export interface ECDSAAlgorithm {
  name: 'ECDSA';
  namedCurve: ECNamedCurve;
  hash: ECDSAHashAlgorithm;
}

// ============================================================
// Key Generation Types
// ============================================================

/**
 * ECDH key pair generation parameters
 *
 * Defines the parameters required to generate an elliptic curve key pair
 * suitable for Diffie-Hellman key agreement operations.
 *
 * @property {"ECDH"} name - Algorithm identifier for key generation
 * @property {ECNamedCurve} namedCurve - Named curve specification (P-256 recommended for most use cases)
 */
export interface ECDHKeyGenParams {
  name: 'ECDH';
  namedCurve: ECNamedCurve;
}

/**
 * ECDSA key pair generation parameters
 *
 * Defines the parameters required to generate an elliptic curve key pair
 * suitable for digital signature operations.
 *
 * @property {"ECDSA"} name - Algorithm identifier for key generation
 * @property {ECNamedCurve} namedCurve - Named curve specification (P-256 recommended for most use cases)
 * @property {ECDSAHashAlgorithm} hash - Hash algorithm to be used with the key for signatures
 */
export interface ECDSAKeyGenParams {
  name: 'ECDSA';
  namedCurve: ECNamedCurve;
  hash: ECDSAHashAlgorithm;
}

// ============================================================
// Operation Types
// ============================================================

/**
 * ECDH key derivation operation parameters
 *
 * Parameters used during ECDH key derivation operations (deriveKey or deriveBits).
 * Requires the peer's public key to compute the shared secret.
 *
 * @property {"ECDH"} name - Algorithm identifier for the operation
 * @property {CryptoKey} public - The peer's public key used to derive the shared secret
 */
export interface ECDHParams {
  name: 'ECDH';
  public: CryptoKey;
}

/**
 * ECDSA signature operation parameters
 *
 * Parameters used during ECDSA signing and verification operations.
 * The hash algorithm must match the one specified during key generation.
 *
 * @property {"ECDSA"} name - Algorithm identifier for the operation
 * @property {ECDSAHashAlgorithm} hash - Hash algorithm to use for the signature operation
 */
export interface ECDSAParams {
  name: 'ECDSA';
  hash: ECDSAHashAlgorithm;
}

/**
 * AES-GCM key generation parameters for derived keys
 *
 * Specifies the parameters for generating or deriving an AES key
 * for use with GCM (Galois/Counter Mode) authenticated encryption.
 *
 * @property {"AES-GCM"} name - Algorithm identifier for AES-GCM
 * @property {128 | 192 | 256} length - Key length in bits (256 recommended for maximum security)
 */
export interface AESGCMKeyGenParams {
  name: 'AES-GCM';
  length: 128 | 192 | 256;
}

// ============================================================
// Union Types
// ============================================================

/**
 * All supported EC algorithms
 */
export type ECAlgorithm = ECDHAlgorithm | ECDSAAlgorithm;

/**
 * All supported EC key generation algorithms
 */
export type ECKeyGenParams = ECDHKeyGenParams | ECDSAKeyGenParams;

/**
 * All supported EC operation parameters
 */
export type ECParams = ECDHParams | ECDSAParams;

// ============================================================
// Utility Types
// ============================================================

// ==========================================
// EC IMPORT
// ==========================================

/**
 * ECDH key import algorithm parameters
 *
 * Configuration for importing existing ECDH keys from external sources
 * such as PEM, DER, or JWK formats.
 *
 * @property {"ECDH"} name - Algorithm identifier for key import
 * @property {ECNamedCurve} [namedCurve] - Optional curve specification (may be derived from key data)
 */
export interface ImportECDHAlgorithm {
  name: 'ECDH';
  namedCurve?: ECNamedCurve;
}

// ==========================================
// EC GENERATE KEY
// ==========================================

/**
 * ECDH key generation algorithm parameters
 *
 * Configuration for generating new ECDH key pairs with optional
 * curve specification. Defaults to P-256 if not specified.
 *
 * @property {"ECDH"} name - Algorithm identifier for key generation
 * @property {ECNamedCurve} [namedCurve] - Optional curve specification (defaults to P-256 if omitted)
 */
export interface GenerateECDHAlgorithm {
  name: 'ECDH';
  namedCurve?: ECNamedCurve;
}

// ==========================================
// EC DERIVE KEY
// ==========================================

/**
 * ECDH key derivation algorithm parameters
 *
 * Configuration for deriving a shared secret or key material using
 * ECDH key agreement with a peer's public key.
 *
 * @property {"ECDH"} name - Algorithm identifier for key derivation
 * @property {CryptoKey} public - The peer's public ECDH key for shared secret computation
 */
export interface DeriveECDHAlgorithm {
  name: 'ECDH';
  public: CryptoKey;
}

/**
 * AES key derivation parameters
 *
 * Specifies the target AES algorithm and key length when deriving
 * an AES key from ECDH shared secret or other key material.
 *
 * @property {"AES-GCM" | "AES-CBC" | "AES-KW"} name - Target AES mode (GCM for authenticated encryption, CBC for standard encryption, KW for key wrapping)
 * @property {128 | 192 | 256} length - Desired key length in bits (256 recommended for maximum security)
 */
export interface DeriveAESAlgorithm {
  name: 'AES-GCM' | 'AES-CBC' | 'AES-KW';
  length: 128 | 192 | 256;
}

// ==========================================
// AES ENCRYPTION ALGORITHM
// ==========================================

/**
 * AES-GCM encryption/decryption algorithm parameters
 *
 * Configuration for AES-GCM authenticated encryption operations.
 * GCM mode provides both confidentiality and authenticity.
 *
 * @property {"AES-GCM"} name - Algorithm identifier for AES-GCM
 * @property {BufferSource} iv - Initialization vector (nonce) - must be unique for each encryption with the same key (typically 12 bytes)
 * @property {number} [tagLength] - Authentication tag length in bits (defaults to 128, can be 96, 104, 112, 120, or 128)
 */
export interface EncryptAESAlgorithm {
  name: 'AES-GCM';
  iv: BufferSource;
  tagLength?: number;
}

/**
 * Supported cipher suite combinations
 *
 * Defines standardized combinations of AES-GCM encryption and SHA hash algorithms
 * for consistent cryptographic operations across the application.
 *
 * @enum {string}
 * @property {string} AES_256_GCM_SHA256 - AES-256-GCM with SHA-256 (highest security, recommended)
 * @property {string} AES_192_GCM_SHA256 - AES-192-GCM with SHA-256 (medium security)
 * @property {string} AES_128_GCM_SHA256 - AES-128-GCM with SHA-256 (standard security, faster)
 * @property {string} AES_256_GCM_SHA384 - AES-256-GCM with SHA-384 (highest security with larger hash)
 */
export enum CipherSuite {
  AES_256_GCM_SHA256 = 'AES_256_GCM_SHA256',
  AES_192_GCM_SHA256 = 'AES_192_GCM_SHA256',
  AES_128_GCM_SHA256 = 'AES_128_GCM_SHA256',
  AES_256_GCM_SHA384 = 'AES_256_GCM_SHA384',
}

/**
 * NIST standard elliptic curves
 *
 * Enumeration of NIST-approved elliptic curves supported by Web Crypto API.
 * Each curve offers different security levels and performance characteristics.
 *
 * @enum {string}
 * @property {string} P256 - NIST P-256 curve (secp256r1) - 128-bit security, widely supported, recommended for most use cases
 * @property {string} P384 - NIST P-384 curve (secp384r1) - 192-bit security, higher security level
 * @property {string} P521 - NIST P-521 curve (secp521r1) - 256-bit security, maximum security but slower
 */
export enum ECCurve {
  P256 = 'P-256',
  P384 = 'P-384',
  P521 = 'P-521',
}

/**
 * Result of an ECIES (Elliptic Curve Integrated Encryption Scheme) encryption operation
 *
 * Contains the ephemeral public key and encrypted data needed for decryption.
 * This implements a hybrid encryption scheme using EC for key agreement and AES for data encryption.
 *
 * @property {string} ephemeralPublicKey - Ephemeral public key in Base64/PEM format (generated for this encryption only)
 * @property {string} ciphertext - Encrypted data containing IV + ciphertext + authentication tag (Base64 encoded)
 */
export interface EncryptResult {
  ephemeralPublicKey: string;
  ciphertext: string;
}

/**
 * Complete cipher suite configuration
 *
 * Comprehensive configuration object defining all cryptographic parameters
 * for a specific cipher suite implementation.
 *
 * @property {"AES-GCM"} algorithm - Symmetric encryption algorithm (AES-GCM for authenticated encryption)
 * @property {128 | 192 | 256} keySizeBits - AES key size in bits
 * @property {"SHA-256" | "SHA-384"} hashAlgorithm - Hash algorithm for key derivation and HMAC operations
 * @property {number} keySizeBytes - AES key size in bytes (derived from keySizeBits / 8)
 * @property {number} tagLengthBits - GCM authentication tag length in bits (typically 128)
 * @property {number} ivLengthBytes - Initialization vector length in bytes (typically 12 for GCM)
 */
export interface CipherSuiteConfig {
  algorithm: 'AES-GCM';
  keySizeBits: 128 | 192 | 256;
  hashAlgorithm: 'SHA-256' | 'SHA-384';
  keySizeBytes: number;
  tagLengthBits: number;
  ivLengthBytes: number;
}
