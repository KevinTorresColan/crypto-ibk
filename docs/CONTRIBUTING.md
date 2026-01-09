# Guía para Contribuir

Gracias por tu interés en contribuir a `ibk-crypto` 🎉.

## Cómo empezar

1. **Contacta al equipo de arquitectura**
   - Esta es una librería corporativa de Interbank
   - Coordina con el equipo antes de hacer contribuciones significativas

2. **Clona el repositorio**:

   ```bash
   git clone <repository-url>
   cd crypto
   ```

3. **Instala las dependencias**:

   ```bash
   npm install
   ```

4. **Crea una rama para tu funcionalidad o corrección**:

   ```bash
   git checkout -b feat/nueva-funcionalidad
   # o
   git checkout -b fix/corregir-bug
   ```

5. **Haz tus cambios siguiendo las convenciones del proyecto**

6. **Asegúrate de que el código pase todas las validaciones**:

   ```bash
   npm run build
   ```

7. **Haz commit de tus cambios** siguiendo [Conventional Commits](https://interbankpe.sharepoint.com/sites/DevSecOpsInterbank/SitePages/guias_y_manuales/conventional_commits.aspx):

   ```bash
   git commit -m "feat(rsa): agregar soporte para RSA-PSS"
   ```

8. **Haz push a tu rama**:

   ```bash
   git push origin feat/nueva-funcionalidad
   ```

9. **Abre un Pull Request** explicando claramente:
   - El propósito del cambio
   - Qué problema resuelve o qué funcionalidad agrega
   - Cómo probarlo
   - Impacto en la API existente (si aplica)

## Convenciones de Código

### Commits

Usamos [Conventional Commits](https://interbankpe.sharepoint.com/sites/DevSecOpsInterbank/SitePages/guias_y_manuales/conventional_commits.aspx) para mensajes de commit estructurados:

```
<tipo>[ámbito opcional]: <descripción>

[cuerpo opcional]

[nota de pie opcional]
```

**Tipos permitidos**:

- `feat`: Nueva funcionalidad
- `fix`: Corrección de bug
- `docs`: Cambios en documentación
- `style`: Formato de código (no afecta la lógica)
- `refactor`: Refactorización de código
- `perf`: Mejoras de rendimiento
- `test`: Agregar o modificar tests
- `chore`: Tareas de mantenimiento
- `ci`: Cambios en configuración de CI/CD
- `build`: Cambios en sistema de build

**Ejemplos**:

```bash
feat(rsa): agregar soporte para RSA-OAEP con SHA-512
fix(ec): corregir derivación de claves ECDH
docs(readme): actualizar ejemplos de uso
refactor(crypto): simplificar factory de ciphers
```

### TypeScript

- Usa **TypeScript strict mode** (`strict: true`)
- Evita el uso de `any` - usa tipos específicos o `unknown`
- Define tipos e interfaces explícitamente
- Usa `readonly` cuando sea apropiado
- Prefiere `const` sobre `let`
- Usa `async/await` en lugar de Promises encadenadas

**Ejemplo**:

```typescript
// ✅ Bueno
interface EncryptOptions {
  readonly data: string;
  readonly publicKey: CryptoKey;
}

async function encrypt(options: EncryptOptions): Promise<string> {
  // implementación
}

// ❌ Evitar
function encrypt(data: any, key: any) {
  // implementación
}
```

### Estilo de Código

- Sigue la guía de estilo de `eslint` configurada en el proyecto
- Usa `prettier` para formateo automático
- Usa nombres descriptivos y en inglés para variables y funciones
- Mantén las funciones pequeñas (idealmente < 20 líneas)
- Una función debe hacer una sola cosa

### Estructura de Archivos

**Application Layer** (`src/application/`):

- **Use Cases**: Coloca nuevos casos de uso en `src/application/use-cases/`
  - Casos de uso generales directamente en la carpeta
  - Casos de uso específicos de RSA en `src/application/use-cases/rsa/`
- **Ports**: Nuevas interfaces de puertos en `src/application/ports/`
- **Builders**: Builders y factories en `src/application/builders/`
- **Contexts**: Contextos de inyección en `src/application/context/`
- **Services**: Servicios específicos en `src/application/service/ec/` o `src/application/service/rsa/`

**Domain Layer** (`src/domain/`):

- **Types**: Tipos de dominio en `src/domain/types/`
  - `client.type.ts`: Tipos de cliente y configuración
  - `rsa.types.ts`: Tipos específicos de RSA
  - `ec.types.ts`: Tipos de curvas elípticas
- **Repository**: Interfaces de repositorios en `src/domain/repository/`
  - `crypto.repository.ts`: Interfaz para operaciones criptográficas
  - `key-store.repository.ts`: Interfaz para almacenamiento de claves

**Infrastructure Layer** (`src/infrastructure/`):

- **Adapters**: Implementaciones concretas
  - `src/infrastructure/adapters/crypto/`: Adaptadores criptográficos (ej: `webcrypto.adapter.ts`)
  - `src/infrastructure/adapters/store/`: Adaptadores de almacenamiento (ej: `memory-keystore.adapter.ts`)
  - `src/infrastructure/adapters/api/`: Adaptadores de API pública (ej: `crypto.adapter.ts`)

**Composition Root** (`src/composition-root/`):

- Configuración del contenedor DI en `src/composition-root/container/`
- Exportaciones públicas en `src/composition-root/container/index.ts`

## Testing

Actualmente no hay tests configurados. Si deseas contribuir con tests:

1. Configura Jest o Vitest
2. Crea tests unitarios para casos de uso
3. Crea tests de integración para el flujo completo
4. Asegura cobertura mínima de 80%

## Documentación

Al agregar nuevas funcionalidades:

1. **Actualiza el README.md** con ejemplos de uso
2. **Documenta el código** con JSDoc cuando sea necesario:
   ```typescript
   /**
    * Cifra datos usando RSA-OAEP
    * @param data - Datos a cifrar
    * @param publicKey - Clave pública RSA
    * @returns Datos cifrados en base64
    */
   async function encryptRSA(
     data: string,
     publicKey: CryptoKey,
   ): Promise<string>;
   ```
3. **Actualiza CHANGELOG.md** con los cambios
4. **Agrega ejemplos** en la carpeta `demo/` si aplica
5. **Actualiza ARCHITECTURE.md** si cambias la estructura

## Reportar Bugs

Si encuentras un bug, abre un issue con la siguiente información:

### Plantilla de Issue

````markdown
## Descripción del Bug

[Descripción clara del problema]

## Pasos para Reproducir

1. Paso 1
2. Paso 2
3. ...

## Comportamiento Esperado

[Qué debería suceder]

## Comportamiento Actual

[Qué sucede en realidad]

## Entorno

- Versión de ibk-crypto: [ej. 1.0.0]
- Navegador/Node.js: [ej. Chrome 120, Node 18.17.0]
- SO: [ej. macOS 14.0]

## Código de Ejemplo

```typescript
// Código que reproduce el problema
```
````

## Información Adicional

[Cualquier otra información relevante, logs, screenshots, etc.]

````

Luego solicita la validación a tu focal de arquitectura de Software.

## Pull Request Process

1. **Asegúrate de que tu código**:
   - Pasa el linter (`npm run lint`)
   - Compila sin errores (`npm run build`)
   - Sigue las convenciones de este documento

2. **Actualiza la documentación** según sea necesario

3. **El PR debe tener**:
   - Título descriptivo siguiendo Conventional Commits
   - Descripción clara del cambio
   - Referencias a issues relacionados (si aplica)
   - Capturas de pantalla (si aplica para ejemplos visuales)

4. **Revisión**:
   - Al menos un aprobador requerido
   - Todos los comentarios deben ser resueltos
   - CI debe pasar (cuando esté configurado)

## Proceso de Release

1. Actualiza `CHANGELOG.md` con los cambios de la nueva versión
2. Actualiza la versión en `package.json`:
   ```bash
   npm version patch  # Para bug fixes (1.0.0 -> 1.0.1)
   npm version minor  # Para nuevas features (1.0.0 -> 1.1.0)
   npm version major  # Para breaking changes (1.0.0 -> 2.0.0)
````

3. Haz commit del cambio de versión
4. Crea un tag:
   ```bash
   git tag -a v1.0.1 -m "Release v1.0.1"
   git push origin v1.0.1
   ```
5. Publica a npm (si aplica):
   ```bash
   npm publish
   ```

## Código de Conducta

### Nuestro Compromiso

- Ser respetuoso y profesional
- Valorar diferentes perspectivas
- Aceptar críticas constructivas
- Enfocarse en lo mejor para el proyecto

### Comportamiento Esperado

- ✅ Comunicación clara y constructiva
- ✅ Ayudar a otros contribuidores
- ✅ Ser paciente con principiantes
- ✅ Dar crédito apropiado

### Comportamiento Inaceptable

- ❌ Lenguaje ofensivo o discriminatorio
- ❌ Ataques personales
- ❌ Acoso de cualquier tipo
- ❌ Compartir información privada sin permiso

## Recursos

- [Manual de Desarrollo Seguro de Aplicaciones](https://interbankpe.sharepoint.com/sites/PortaldeCiberseguridad/Documentos%20compartidos/Forms/AllItems.aspx?id=%2Fsites%2FPortaldeCiberseguridad%2FDocumentos%20compartidos%2FManuales%2FDesarrollo%20seguro%2FManual%20Desarrollo%20Seguro%20de%20Aplicaciones%2Epdf&parent=%2Fsites%2FPortaldeCiberseguridad%2FDocumentos%20compartidos%2FManuales%2FDesarrollo%20seguro)
- [Buenas prácticas de Seguridad aplicadas en Frontend Web](https://interbankpe.sharepoint.com/sites/ArquitecturaDeSoftware/SitePages/Buenas-pr%C3%A1cticas-de-Seguridad-aplicada-en-Frontend.aspx?promotedState=0&source=FromAppBar)
- [Code.IBK](https://interbankpe.sharepoint.com/sites/DevSecOpsInterbank/SitePages/CodeIBK.aspx)
- [Conventional Commits](https://interbankpe.sharepoint.com/sites/DevSecOpsInterbank/SitePages/guias_y_manuales/conventional_commits.aspx)

## Preguntas

Si tienes preguntas sobre cómo contribuir, contacta a:

- Focal de Arquitectura de Software
- Equipo de desarrollo mediante los canales corporativos

---

¡Gracias por contribuir a `ibk-crypto`! 🚀
