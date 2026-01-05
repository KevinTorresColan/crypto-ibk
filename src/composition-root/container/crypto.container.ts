/* ---------------- DOMAIN ---------------- */
import { CryptoRepository } from '../../domain/repository/crypto.repository';
import { KeyStoreRepository } from '../../domain/repository/key-store.repository';

/* ---------------- APPLICATION - USE CASES ---------------- */
import { ImportKeyUseCase } from '../../application/use-cases/import-key.usecase';
import { ExportKeysUseCase } from '../../application/use-cases/export-keys.usecase';
import { GenerateKeyPairUseCase } from '../../application/use-cases/generate-keypair.usecase';
import { DeriveBitsUseCase } from '../../application/use-cases/derive-bits.usecase';
import { DigestUseCase } from '../../application/use-cases/digest.usecase';
import { EncryptUseCase } from '../../application/use-cases/encrypt.usecase';
import { DecryptUseCase } from '../../application/use-cases/decrypt.usecase';
import GetRandomUseCase from '../../application/use-cases/get-random.usecase';
import { SignUseCase } from '../../application/use-cases/sign.usecase';
import { VerifyUseCase } from '../../application/use-cases/verify.usecase';

/* ---------------- APPLICATION - FACTORIES ---------------- */
import { OTECCipherFactory } from '../../application/builders/otec-cipher.factory';
import { ECCipherFactory } from '../../application/builders/ec-cipher.factory';
import { RSAFactory } from '../../application/builders/rsa.factory';

/* ---------------- APPLICATION - CONTEXTS ---------------- */
import { ECCipherContext } from '../../application/context/ec-cipher.context';
import { RSAContext } from '../../application/context/rsa.context';

/* ---------------- APPLICATION - FACADE ---------------- */
import { CryptoApplication } from '../../application/crypto.application';

/* ---------------- INFRASTRUCTURE ---------------- */
import { WebCryptoAdapter } from '../../infrastructure/adapters/crypto/webcrypto.adapter';
import { MemoryKeyStore } from '../../infrastructure/adapters/store/memory-keystore.adapter';
import { CryptoAdapter } from '../../infrastructure/adapters/api/crypto.adapter';

/* ---------------- INFRA ---------------- */

const cryptoRepo: CryptoRepository = new WebCryptoAdapter();
const keyStore: KeyStoreRepository = MemoryKeyStore.getInstance();

/* ---------------- USE CASES ---------------- */

const importKeyUC = new ImportKeyUseCase(cryptoRepo);
const exportKeyUC = new ExportKeysUseCase(cryptoRepo);
const generateKeyPairUC = new GenerateKeyPairUseCase(cryptoRepo);
const deriveBitsUC = new DeriveBitsUseCase(cryptoRepo);
const digestUC = new DigestUseCase(cryptoRepo);
const encryptUC = new EncryptUseCase(cryptoRepo);
const decryptUC = new DecryptUseCase(cryptoRepo);
const getRandomUC = new GetRandomUseCase(cryptoRepo);
const signatureUC = new SignUseCase(cryptoRepo);
const verifyUC = new VerifyUseCase(cryptoRepo);

/* ---------------- CONTEXT ---------------- */

const ecCipherContext: ECCipherContext = {
  _importKeyUseCase: importKeyUC,
  _exportKeyUseCase: exportKeyUC,
  _generateKeyPairUseCase: generateKeyPairUC,
  _deriveBitsUseCase: deriveBitsUC,
  _digestUseCase: digestUC,
  _encryptUseCase: encryptUC,
  _decryptUseCase: decryptUC,
  _getRandomUseCase: getRandomUC,
  _signUseCase: signatureUC,
  _verifyUseCase: verifyUC,
};

const rsaContext: RSAContext = {
  _importKeyUseCase: importKeyUC,
  _encryptUseCase: encryptUC,
  _decryptUseCase: decryptUC,
  _signUseCase: signatureUC,
  _verifyUseCase: verifyUC,
  _exportKeyUseCase: exportKeyUC,
  _generateKeyPairUseCase: generateKeyPairUC,
};

/* ---------------- FACTORIES ---------------- */

const otecFactory = new OTECCipherFactory(ecCipherContext);

const ecFactory = new ECCipherFactory(ecCipherContext);

const rsaService = new RSAFactory(rsaContext);

/* ---------------- APPLICATION FACADE ---------------- */

const cryptoApplication = new CryptoApplication(
  otecFactory,
  ecFactory,
  rsaService,
  keyStore,
);

/* ---------------- PUBLIC API ---------------- */

export const CryptoClient = new CryptoAdapter(cryptoApplication);

export { HMACMode } from '../../domain/types/hmac.types';
export { CipherSuite, ECCurve } from '../../domain/types/EC.types';
export { Mode, SignMode } from '../../domain/types/client.type';
