import { DecryptUseCase } from '../use-cases/decrypt.usecase';
import { DeriveBitsUseCase } from '../use-cases/derive-bits.usecase';
import { DigestUseCase } from '../use-cases/digest.usecase';
import { EncryptUseCase } from '../use-cases/encrypt.usecase';
import { ExportKeysUseCase } from '../use-cases/export-keys.usecase';
import { GenerateKeyPairUseCase } from '../use-cases/generate-keypair.usecase';
import GetRandomUseCase from '../use-cases/get-random.usecase';
import { ImportKeyUseCase } from '../use-cases/import-key.usecase';
import { SignUseCase } from '../use-cases/sign.usecase';
import { VerifyUseCase } from '../use-cases/verify.usecase';

export interface ECCipherContext {
  _importKeyUseCase: ImportKeyUseCase;
  _exportKeyUseCase: ExportKeysUseCase;
  _generateKeyPairUseCase: GenerateKeyPairUseCase;
  _deriveBitsUseCase: DeriveBitsUseCase;
  _digestUseCase: DigestUseCase;
  _encryptUseCase: EncryptUseCase;
  _decryptUseCase: DecryptUseCase;
  _getRandomUseCase: GetRandomUseCase;
  _signUseCase: SignUseCase;
  _verifyUseCase: VerifyUseCase;
}
