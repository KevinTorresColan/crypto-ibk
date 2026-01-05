/* eslint-disable @typescript-eslint/no-explicit-any */
// ============================================================
// RSA Algorithm Types for Web Crypto API
// ============================================================

/**
 * Supported hash algorithms for RSA-OAEP encryption
 * Web Crypto API only supports these hash algorithms for RSA-OAEP
 */
export type RSAOAEPHashAlgorithm = 'SHA-256' | 'SHA-512';

/**
 * Supported hash algorithms for RSA-PSS signatures
 * Web Crypto API supports these hash algorithms for RSA-PSS
 */
export type RSAPSSHashAlgorithm = 'SHA-256' | 'SHA-384' | 'SHA-512';

/**
 * Supported hash algorithms for RSASSA-PKCS1-v1_5 signatures
 * Web Crypto API supports these hash algorithms for RSASSA-PKCS1-v1_5
 */
export type RSASSAPKCS1v15HashAlgorithm = 'SHA-256' | 'SHA-384' | 'SHA-512';

// ============================================================
// RSA Algorithm Configuration Types
// ============================================================

/**
 * RSA-OAEP algorithm configuration for encryption operations
 *
 * RSA-OAEP (Optimal Asymmetric Encryption Padding) is a secure padding scheme
 * that provides semantic security for RSA encryption.
 *
 * @property {"RSA-OAEP"} name - Algorithm identifier for RSA-OAEP
 * @property {RSAOAEPHashAlgorithm} hash - Hash algorithm used for OAEP padding (SHA-256 or SHA-512)
 */
export interface RSAOAEPAlgorithm {
  name: 'RSA-OAEP';
  hash: RSAOAEPHashAlgorithm;
}

/**
 * RSA-PSS algorithm configuration for digital signature operations
 *
 * RSA-PSS (Probabilistic Signature Scheme) is a provably secure signature scheme
 * with tight security reduction. It's recommended for new applications.
 *
 * @property {"RSA-PSS"} name - Algorithm identifier for RSA-PSS
 * @property {RSAPSSHashAlgorithm} hash - Hash algorithm used for signature generation (SHA-256, SHA-384, or SHA-512)
 */
export interface RSAPSSAlgorithm {
  name: 'RSA-PSS';
  hash: RSAPSSHashAlgorithm;
}

/**
 * RSASSA-PKCS1-v1_5 algorithm configuration for digital signature operations
 *
 * RSASSA-PKCS1-v1_5 is the traditional RSA signature scheme defined in PKCS#1.
 * While still widely used for compatibility, RSA-PSS is recommended for new applications.
 *
 * @property {"RSASSA-PKCS1-v1_5"} name - Algorithm identifier for RSASSA-PKCS1-v1_5
 * @property {RSASSAPKCS1v15HashAlgorithm} hash - Hash algorithm used for signature generation (SHA-256, SHA-384, or SHA-512)
 */
export interface RSASSAPKCS1v15Algorithm {
  name: 'RSASSA-PKCS1-v1_5';
  hash: RSASSAPKCS1v15HashAlgorithm;
}

// ============================================================
// Key Generation Types
// ============================================================

/**
 * RSA key generation parameters for RSA-OAEP encryption keys
 *
 * Defines the parameters required to generate an RSA key pair suitable for
 * encryption and decryption operations using the OAEP padding scheme.
 *
 * @property {"RSA-OAEP"} name - Algorithm identifier for key generation
 * @property {1024 | 2048 | 4096} modulusLength - Length of the RSA modulus in bits (2048 or 4096 recommended for security)
 * @property {Uint8Array} publicExponent - Public exponent value (typically 65537 represented as [0x01, 0x00, 0x01])
 * @property {RSAOAEPHashAlgorithm} hash - Hash algorithm to be used with the key
 */
export interface RSAOAEPKeyGenParams {
  name: 'RSA-OAEP';
  modulusLength: 1024 | 2048 | 4096;
  publicExponent: Uint8Array;
  hash: RSAOAEPHashAlgorithm;
}

/**
 * RSA key generation parameters for RSA-PSS signature keys
 *
 * Defines the parameters required to generate an RSA key pair suitable for
 * digital signature operations using the PSS (Probabilistic Signature Scheme) padding.
 *
 * @property {"RSA-PSS"} name - Algorithm identifier for key generation
 * @property {1024 | 2048 | 4096} modulusLength - Length of the RSA modulus in bits (2048 or 4096 recommended for security)
 * @property {Uint8Array} publicExponent - Public exponent value (typically 65537 represented as [0x01, 0x00, 0x01])
 * @property {RSAPSSHashAlgorithm} hash - Hash algorithm to be used with the key
 */
export interface RSAPSSKeyGenParams {
  name: 'RSA-PSS';
  modulusLength: 1024 | 2048 | 4096;
  publicExponent: Uint8Array;
  hash: RSAPSSHashAlgorithm;
}

/**
 * RSA key generation parameters for RSASSA-PKCS1-v1_5 signature keys
 *
 * Defines the parameters required to generate an RSA key pair suitable for
 * digital signature operations using the traditional PKCS#1 v1.5 padding scheme.
 *
 * @property {"RSASSA-PKCS1-v1_5"} name - Algorithm identifier for key generation
 * @property {1024 | 2048 | 4096} modulusLength - Length of the RSA modulus in bits (2048 or 4096 recommended for security)
 * @property {Uint8Array} publicExponent - Public exponent value (typically 65537 represented as [0x01, 0x00, 0x01])
 * @property {RSASSAPKCS1v15HashAlgorithm} hash - Hash algorithm to be used with the key
 */
export interface RSASSAPKCS1v15KeyGenParams {
  name: 'RSASSA-PKCS1-v1_5';
  modulusLength: 1024 | 2048 | 4096;
  publicExponent: Uint8Array;
  hash: RSASSAPKCS1v15HashAlgorithm;
}

// ============================================================
// Operation Types
// ============================================================

/**
 * RSA-OAEP encryption/decryption operation parameters
 *
 * Parameters used during RSA-OAEP encryption and decryption operations.
 * The optional label provides additional authenticated data.
 *
 * @property {"RSA-OAEP"} name - Algorithm identifier for the operation
 * @property {ArrayBuffer} [label] - Optional label (associated data) to be authenticated with the ciphertext
 */
export interface RSAOAEPParams {
  name: 'RSA-OAEP';
  label?: ArrayBuffer;
}

/**
 * RSA-PSS signature operation parameters
 *
 * Parameters used during RSA-PSS signing and verification operations.
 * The salt length affects the security level of the signature.
 *
 * @property {"RSA-PSS"} name - Algorithm identifier for the operation
 * @property {number} saltLength - Length of the random salt in bytes (typically matches the hash output length)
 */
export interface RSAPSSParams {
  name: 'RSA-PSS';
  saltLength: number;
}

/**
 * RSASSA-PKCS1-v1_5 signature operation parameters
 *
 * Parameters used during RSASSA-PKCS1-v1_5 signing and verification operations.
 * This scheme doesn't require additional parameters beyond the algorithm name.
 *
 * @property {"RSASSA-PKCS1-v1_5"} name - Algorithm identifier for the operation
 */
export interface RSASSAPKCS1v15Params {
  name: 'RSASSA-PKCS1-v1_5';
}

// ============================================================
// Union Types
// ============================================================

/**
 * All supported RSA algorithms for key import
 */
export type RSAAlgorithm =
  | RSAOAEPAlgorithm
  | RSAPSSAlgorithm
  | RSASSAPKCS1v15Algorithm;

/**
 * All supported RSA key generation parameters
 */
export type RSAKeyGenParams =
  | RSAOAEPKeyGenParams
  | RSAPSSKeyGenParams
  | RSASSAPKCS1v15KeyGenParams;

/**
 * All supported RSA operation parameters
 */
export type RSAParams = RSAOAEPParams | RSAPSSParams | RSASSAPKCS1v15Params;

/**
 * Simplified RSA encryption algorithm configuration
 *
 * Provides a simplified interface for RSA-OAEP encryption operations
 * with optional hash algorithm selection.
 *
 * @property {"RSA-OAEP"} name - Fixed algorithm identifier for RSA-OAEP
 * @property {"SHA-256" | "SHA-512"} [hash] - Optional hash algorithm (defaults to SHA-256 if not specified)
 */
export interface EncryptRSA {
  name: 'RSA-OAEP';
  hash?: 'SHA-256' | 'SHA-512';
}

/**
 * Comprehensive options for RSA encryption operations
 *
 * Encapsulates all configuration options needed for performing RSA encryption,
 * including optional digital signature support for authenticated encryption.
 *
 * @property {RSAAlgorithm} [algorithm] - RSA algorithm configuration (defaults to RSA-OAEP with SHA-256 if not specified)
 * @property {string} publicKeyShared - The public key in PEM or DER format for encryption
 * @property {any} data - The data to be encrypted (will be serialized if not already a buffer)
 * @property {boolean} [isExtractable=false] - Whether the imported key should be extractable
 * @property {Iterable<KeyUsage>} [keyUsages] - Allowed key usages (e.g., ['encrypt'])
 * @property {boolean} [hasSignature=false] - Whether to include a digital signature with the encrypted data
 * @property {Object} [sigOptions] - Signature options (required if hasSignature is true)
 * @property {"pem" | "der"} sigOptions.format - Format of the signing key
 * @property {string} sigOptions.keyName - Name or path to the signing key
 */
export interface RSAEncryptOptions {
  algorithm?: RSAAlgorithm;
  data: any;
  hasSignature?: boolean;
  isExtractable?: boolean;
  keyUsages?: Iterable<KeyUsage>;
  publicKeyShared: string;
  sigOptions?: {
    format: 'pem' | 'der';
    keyName: string;
  };
  type?: 'encrypt' | 'decrypt';
}

/**
 * Response structure for complete RSA encryption operations
 *
 * Contains the encrypted data along with optional signature and public key
 * for authenticated encryption scenarios.
 *
 * @property {string} ciphertext - The encrypted data encoded as a Base64 string
 * @property {string} [signature] - Optional digital signature of the plaintext (Base64 encoded)
 * @property {string | ArrayBuffer} [publicKeySign] - Optional public key used for signature verification
 */
export interface EncryptRSACompleteResponse {
  ciphertext: string;
  signature?: string;
  publicKeySign?: string | ArrayBuffer;
}
