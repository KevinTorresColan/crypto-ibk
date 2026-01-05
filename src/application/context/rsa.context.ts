import { DecryptUseCase } from '../use-cases/decrypt.usecase';
import { EncryptUseCase } from '../use-cases/encrypt.usecase';
import { ExportKeysUseCase } from '../use-cases/export-keys.usecase';
import { GenerateKeyPairUseCase } from '../use-cases/generate-keypair.usecase';
import { ImportKeyUseCase } from '../use-cases/import-key.usecase';
import { SignUseCase } from '../use-cases/sign.usecase';
import { VerifyUseCase } from '../use-cases/verify.usecase';

export interface RSAContext {
  _importKeyUseCase: ImportKeyUseCase;
  _encryptUseCase: EncryptUseCase;
  _decryptUseCase: DecryptUseCase;
  _signUseCase: SignUseCase;
  _verifyUseCase: VerifyUseCase;
  _exportKeyUseCase: ExportKeysUseCase;
  _generateKeyPairUseCase: GenerateKeyPairUseCase;
}
