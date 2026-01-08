# Proyecto Angular - Demo de ibk-crypto

Este proyecto Angular es un ejemplo completo de integración de la librería `ibk-crypto` que implementa ejemplos de criptografía con:

- **EC (Elliptic Curve)**: Cifrado con curvas elípticas
- **OTEC (One-Time Elliptic Curve)**: Cifrado de un solo uso con curvas elípticas
- **RSA**: Cifrado asimétrico RSA

## 📋 Requisitos previos

- Node.js (v18 o superior)
- npm (v9 o superior)
- Servidor backend corriendo en `http://localhost:3000`

## 🚀 Instalación

```bash
# Instalar dependencias
npm install
```

## ⚙️ Configuración

La URL del API se configura en `/src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000',
};
```

## 🏃 Ejecutar el proyecto

```bash
# Modo desarrollo
npm start

# o
ng serve
```

La aplicación estará disponible en `http://localhost:4200`

## 🏗️ Compilar para producción

```bash
npm run build
```

## 📁 Estructura del proyecto

```
src/app/
├── components/          # Componentes reutilizables
│   ├── header/         # Navegación entre algoritmos
│   ├── get-products/   # Lista de productos
│   └── product-form/   # Formulario de productos
├── modules/            # Módulos principales
│   ├── ec/            # Ejemplos EC (10+ casos de uso)
│   ├── otec/          # Ejemplos OTEC
│   └── rsa/           # Ejemplos RSA (4 casos de uso)
├── services/          # Servicios HTTP
│   ├── ec.service.ts
│   ├── rsa.service.ts
│   ├── keys.service.ts
│   └── product.service.ts
├── interfaces/        # Definiciones TypeScript
├── utils/            # Utilidades (base64, etc.)
└── environments/     # Configuración de entornos
```

## 🔐 Funcionalidades implementadas

### EC (Elliptic Curve)

- ✅ Encrypt/Decrypt básico
- ✅ Encrypt con firma digital
- ✅ Decrypt con verificación de firma
- ✅ Firma digital (sin cifrado)
- ✅ Verificación de firma
- ✅ HMAC con clave del servidor
- ✅ HMAC con clave interna
- ✅ Verificación HMAC (servidor)
- ✅ Verificación HMAC (interna)

### OTEC (One-Time EC)

- ✅ Encrypt de un solo uso
- ✅ Decrypt de un solo uso

### RSA

- ✅ Encrypt/Decrypt PEM
- ✅ Encrypt/Decrypt DER
- ✅ Encrypt con firma PEM
- ✅ Encrypt con firma DER

## 🎯 Uso

1. Asegúrate de que el servidor backend esté corriendo
2. Inicia la aplicación Angular
3. Usa el header para cambiar entre algoritmos (EC, OTEC, RSA)
4. Ingresa datos en el formulario
5. Haz clic en los botones para probar las diferentes operaciones criptográficas
6. Los resultados se mostrarán en la consola del navegador
7. Los productos descifrados aparecerán en la lista

## 🛠️ Tecnologías

- Angular 19.2
- ibk-crypto (librería local)
- RxJS 7.8
- TypeScript 5.7

## 📝 Notas

- Todos los métodos son asíncronos
- Los resultados se loguean en la consola del navegador
- La aplicación usa componentes standalone de Angular
- HttpClient se configura en `app.config.ts`
