# Política de Seguridad

Esta librería forma parte del ecosistema interno de desarrollo de Interbank y está destinada exclusivamente a uso dentro de la organización.

## ⚠️ Uso Exclusivo Corporativo

**IMPORTANTE**: `ibk-crypto` no está autorizada para uso fuera del entorno corporativo de Interbank. El uso indebido o distribución externa está prohibido por la política de confidencialidad de Interbank.

---

## 🔒 Reporte de Vulnerabilidades

Si detectas una vulnerabilidad de seguridad en `ibk-crypto`, **NO compartas el hallazgo por canales públicos** ni externos.

### Proceso de Reporte

Sigue estos pasos para reportar una vulnerabilidad:

#### 1. Notificación Inmediata

Contacta al equipo de Seguridad de Aplicaciones a través de los canales corporativos:

- **Focal de Arquitectura**: Canaliza el hallazgo con tu focal de arquitectura de software
- **Azure DevOps**: Crea un Work Item en el proyecto `Seguridad TI`:
  - Tipo: `Issue`
  - Etiqueta: `vulnerabilidad`
  - Severidad: Según clasificación (ver más abajo)

#### 2. Información Requerida

Proporciona la siguiente información en tu reporte:

````markdown
### Descripción de la Vulnerabilidad

[Descripción clara y concisa del problema]

### Módulo/Función Afectada

- Archivo: [ruta/del/archivo.ts]
- Función/Clase: [nombre]
- Líneas de código: [número]

### Tipo de Vulnerabilidad

[ ] Exposición de datos sensibles
[ ] Inyección de código
[ ] Bypass de validación
[ ] Debilidad criptográfica
[ ] Otro: **\_\_\_**

### Pasos para Reproducir

1. Paso 1
2. Paso 2
3. ...

### Impacto Estimado

[ ] Crítico - Requiere acción inmediata
[ ] Alto - Exposición significativa
[ ] Medio - Riesgo moderado
[ ] Bajo - Impacto limitado

### Prueba de Concepto (PoC)

```typescript
// Código que demuestra la vulnerabilidad
// (opcional pero recomendado)
```
````

### Ambiente Detectado

- Versión de ibk-crypto: [ej. 1.0.0]
- Navegador/Runtime: [ej. Chrome 120, Node 18.17.0]
- Sistema Operativo: [ej. Windows 11, macOS 14]

### Información Adicional

[Cualquier otro detalle relevante]

````

#### 3. No Divulgación

**NUNCA**:
- ❌ Publiques el hallazgo en repositorios públicos (GitHub, GitLab, etc.)
- ❌ Compartas detalles en redes sociales o foros
- ❌ Discutas la vulnerabilidad fuera de canales seguros
- ❌ Explotes la vulnerabilidad en ambientes productivos

**SIEMPRE**:
- ✅ Usa canales corporativos seguros
- ✅ Marca la comunicación como CONFIDENCIAL
- ✅ Coordina con el equipo de seguridad

---

## ⏱️ Tiempo de Respuesta

El tiempo de respuesta varía según el riesgo e impacto del hallazgo:

| Severidad | Tiempo de Respuesta Inicial | Tiempo de Resolución |
|-----------|----------------------------|---------------------|
| **Crítica** | 4 horas | 24-48 horas |
| **Alta** | 24 horas | 1 semana |
| **Media** | 3 días | 2-4 semanas |
| **Baja** | 1 semana | Próximo release |

---

## 📊 Clasificación de Criticidad

Las vulnerabilidades reportadas serán evaluadas con base en el nivel de exposición y criticidad del entorno:

### 🔴 Crítica

Problemas que requieren **atención inmediata**:

- Compromiso de integridad de datos criptográficos
- Ejecución remota de código (RCE)
- Bypass completo de cifrado
- Exposición de claves privadas
- Inyección de código en operaciones criptográficas

**Ejemplo**: Un atacante puede descifrar datos sin conocer la clave privada.

### 🟠 Alta

Exposición significativa que requiere acción prioritaria:

- Exposición de credenciales en código de producción
- Bypass de autenticación/autorización
- Debilidad en algoritmos criptográficos implementados
- Cross-Site Scripting (XSS) en ejemplos o demos
- Filtración de información sensible en logs

**Ejemplo**: Claves hardcodeadas en el código fuente.

### 🟡 Media

Riesgos moderados que deben atenderse:

- Acceso indebido a recursos
- Errores lógicos explotables
- Validaciones insuficientes de entrada
- Configuraciones inseguras por defecto (no críticas)
- Dependencias con vulnerabilidades conocidas

**Ejemplo**: Validación débil de parámetros de entrada que permite valores inesperados.

### 🟢 Baja

Problemas menores sin riesgo inmediato:

- Mejoras de seguridad preventivas
- Exposición mínima de información
- Problemas en documentación o ejemplos
- Configuraciones mejorables

**Ejemplo**: Comentarios en código con información técnica poco sensible.

---

## 🛡️ Buenas Prácticas Internas

Para prevenir incidentes de seguridad al usar `ibk-crypto`:

### Para Desarrolladores

#### ✅ HACER

1. **Usar solo APIs autorizadas** por el equipo de Arquitectura
2. **Validar todas las entradas** antes de operaciones criptográficas
3. **Manejar errores apropiadamente** sin exponer información sensible
4. **Usar HTTPS** siempre para transmisión de datos cifrados
5. **Almacenar claves de forma segura**:
   - Nunca en código fuente
   - Usar almacenamiento seguro del navegador (IndexedDB con cifrado)
   - En backend: variables de entorno o servicios de gestión de secretos
6. **Rotar claves regularmente** según políticas de seguridad
7. **Limpiar claves de memoria** después de usarlas
8. **Usar algoritmos y configuraciones recomendadas** por defecto

#### ❌ NUNCA

1. **Escribir datos sensibles en logs**
   ```typescript
   // ❌ INCORRECTO
   console.log('Clave privada:', privateKey);

   // ✅ CORRECTO
   console.log('Operación de cifrado completada');
````

2. **Hardcodear claves en el código**

   ```typescript
   // ❌ INCORRECTO
   const SECRET_KEY = 'mi-clave-super-secreta-123';

   // ✅ CORRECTO
   const secretKey = await crypto.GetKey('api-key-name');
   ```

3. **Implementar algoritmos criptográficos propios**

   ```typescript
   // ❌ INCORRECTO - Nunca implementes tu propio cifrado
   function myCustomEncrypt(data) {
     /* ... */
   }

   // ✅ CORRECTO - Usa las APIs provistas
   const encrypted = await crypto.RSA({ type: 'encrypt', data, publicKey });
   ```

4. **Enviar datos sensibles sin cifrar**

   ```typescript
   // ❌ INCORRECTO
   fetch('http://api.example.com/data', {
     body: JSON.stringify({ password: userPassword }),
   });

   // ✅ CORRECTO
   const encryptedData = await crypto.RSA({
     type: 'encrypt',
     data: userPassword,
     publicKey,
   });
   fetch('https://api.example.com/data', {
     body: JSON.stringify({ data: encryptedData }),
   });
   ```

5. **Ignorar errores criptográficos**

   ```typescript
   // ❌ INCORRECTO
   try {
     const result = await crypto.decrypt(data);
   } catch (error) {
     // Error silenciado - muy peligroso
   }

   // ✅ CORRECTO
   try {
     const result = await crypto.decrypt(data);
   } catch (error) {
     logger.error('Fallo al descifrar', { operationId });
     throw new Error('Operación no autorizada');
   }
   ```

### Configuraciones Seguras

```typescript
// Ejemplo de configuración segura para RSA
const rsaConfig = {
  name: 'RSA-OAEP',
  modulusLength: 4096, // ✅ Longitud segura
  publicExponent: new Uint8Array([1, 0, 1]),
  hash: 'SHA-256', // ✅ Hash seguro
};

// Ejemplo de configuración segura para EC
const ecConfig = {
  name: 'ECDH',
  namedCurve: 'P-384', // ✅ Curva segura (P-256 mínimo)
};
```

---

## 📚 Recursos de Seguridad

### Documentación Oficial de Interbank

- [Manual de Desarrollo Seguro de Aplicaciones](https://interbankpe.sharepoint.com/sites/PortaldeCiberseguridad/Documentos%20compartidos/Forms/AllItems.aspx?id=%2Fsites%2FPortaldeCiberseguridad%2FDocumentos%20compartidos%2FManuales%2FDesarrollo%20seguro%2FManual%20Desarrollo%20Seguro%20de%20Aplicaciones%2Epdf&parent=%2Fsites%2FPortaldeCiberseguridad%2FDocumentos%20compartidos%2FManuales%2FDesarrollo%20seguro)
- [Buenas prácticas de Seguridad aplicadas en Frontend Web](https://interbankpe.sharepoint.com/sites/ArquitecturaDeSoftware/SitePages/Buenas-pr%C3%A1cticas-de-Seguridad-aplicada-en-Frontend.aspx?promotedState=0&source=FromAppBar)
- [Controles de Seguridad](https://interbankpe.sharepoint.com/:x:/r/sites/IntranetArquitecturaTI/Biblioteca/General/Team%20Arquitectura/Actividades%20de%20aseguramiento%20con%20crews/ControlesSeguridad_v1.xlsx?d=w2d3f45ee273e4946be9fa600289f8b35&csf=1&web=1&e=97YFuu)

### Estándares y Guías Externas

- [OWASP Top 10](https://owasp.org/Top10/)
- [OWASP Cryptographic Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cryptographic_Storage_Cheat_Sheet.html)
- [Web Crypto API - W3C](https://www.w3.org/TR/WebCryptoAPI/)
- [NIST Cryptographic Standards](https://csrc.nist.gov/projects/cryptographic-standards-and-guidelines)

---

## 🔍 Auditorías de Seguridad

`ibk-crypto` será sometida a auditorías regulares:

- **Análisis estático de código**: Herramientas SAST
- **Análisis de dependencias**: Verificación de vulnerabilidades conocidas
- **Code review**: Revisión por pares de cambios críticos
- **Penetration testing**: Pruebas de seguridad en ambientes controlados

---

## 🎯 Cumplimiento y Normativas

Esta librería debe cumplir con:

- Políticas de Seguridad de la Información de Interbank
- Normas de la Superintendencia de Banca, Seguros y AFP (SBS) del Perú
- Estándares PCI-DSS (cuando aplique)
- Ley de Protección de Datos Personales N° 29733

---

## 📞 Contacto de Seguridad

Para consultas relacionadas con seguridad:

- **Equipo de Arquitectura de Software**: Contacta a tu focal
- **Equipo de Seguridad de Aplicaciones**: Via Azure DevOps o canales corporativos
- **Emergencias de seguridad**: Sigue el protocolo de incidentes de seguridad corporativo

---

## ⚖️ Responsabilidad

Los desarrolladores que utilicen `ibk-crypto` son responsables de:

1. Implementar la librería siguiendo las mejores prácticas de seguridad
2. Mantener actualizadas las versiones de la librería
3. Reportar vulnerabilidades de forma responsable
4. No utilizar la librería para fines no autorizados
5. Cumplir con las políticas de seguridad corporativas

---

**Última actualización**: 2 de enero de 2026

**Versión de la política**: 1.0

---

## ✅ Checklist de Seguridad para Desarrolladores

Antes de implementar `ibk-crypto` en tu proyecto:

- [ ] He leído y entendido esta política de seguridad
- [ ] Conozco las buenas prácticas de manejo de claves
- [ ] No almacenaré claves en el código fuente
- [ ] Implementaré manejo apropiado de errores
- [ ] Usaré HTTPS para todas las comunicaciones
- [ ] He revisado la documentación de arquitectura
- [ ] Reportaré cualquier vulnerabilidad que encuentre
- [ ] Mantendré la librería actualizada
- [ ] Seguiré el principio de mínimo privilegio
- [ ] Documentaré las decisiones de seguridad en mi implementación

---

🔐 **La seguridad es responsabilidad de todos. Mantengamos nuestros sistemas seguros.**
