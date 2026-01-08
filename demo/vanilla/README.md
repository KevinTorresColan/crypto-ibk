# Proyecto Vanilla JS - Demo de ibk-crypto

Este proyecto Vanilla JavaScript es un ejemplo completo de integración de la librería `ibk-crypto` sin usar frameworks. Implementa ejemplos de criptografía con:

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

La URL del API se configura en `/src/utils/api.js`:

```javascript
const API_URL = 'http://localhost:3000';
```

## 🏃 Ejecutar el proyecto

```bash
# Modo desarrollo (puerto 5173)
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

## 🏗️ Compilar para producción

```bash
npm run build
```

Los archivos compilados estarán en la carpeta `dist/`

## 📁 Estructura del proyecto

```
vanilla/
├── index.html              # Estructura HTML principal
├── vite.config.js         # Configuración de Vite
├── package.json           # Dependencias
└── src/
    ├── main.js            # Punto de entrada de la aplicación
    ├── styles.css         # Estilos globales
    ├── modules/           # Módulos de algoritmos
    │   ├── ec.module.js   # 10 ejemplos EC
    │   ├── otec.module.js # 2 ejemplos OTEC
    │   └── rsa.module.js  # 4 ejemplos RSA
    ├── services/          # Servicios HTTP
    │   ├── ec.service.js
    │   ├── rsa.service.js
    │   ├── keys.service.js
    │   └── product.service.js
    └── utils/             # Utilidades
        ├── api.js         # Cliente HTTP
        └── general.js     # Funciones base64
```

## 🔐 Funcionalidades implementadas

### EC (Elliptic Curve) - 10 ejemplos

- ✅ Encrypt/Decrypt básico
- ✅ Encrypt con firma digital
- ✅ Decrypt con verificación de firma
- ✅ Firma digital (sin cifrado)
- ✅ Verificación de firma
- ✅ HMAC con clave del servidor
- ✅ HMAC con clave interna
- ✅ Verificación HMAC (servidor)
- ✅ Verificación HMAC (interna)

### OTEC (One-Time EC) - 2 ejemplos

- ✅ Encrypt de un solo uso
- ✅ Decrypt de un solo uso

### RSA - 4 ejemplos

- ✅ Encrypt/Decrypt PEM
- ✅ Encrypt/Decrypt DER
- ✅ Encrypt con firma PEM
- ✅ Encrypt con firma DER

## 🎯 Uso

1. **Inicia el servidor backend** (debe estar corriendo en `http://localhost:3000`)
2. **Ejecuta la aplicación**:
   ```bash
   npm run dev
   ```
3. **Navega** usando los botones del header (EC, OTEC, RSA)
4. **Ingresa datos** en el formulario de cada módulo
5. **Haz clic** en los botones para probar las operaciones criptográficas
6. **Revisa** los resultados en la consola del navegador
7. **Observa** los productos descifrados en la lista

## 🛠️ Tecnologías

- **Vanilla JavaScript** (ES6+ Modules)
- **Vite** - Build tool y servidor de desarrollo
- **ibk-crypto** - Librería de criptografía (local)
- **Fetch API** - Para llamadas HTTP

## 💡 Características técnicas

- ✅ **Sin frameworks** - JavaScript puro
- ✅ **ES6 Modules** - Importaciones nativas
- ✅ **Programación orientada a objetos** - Clases para cada módulo
- ✅ **Async/Await** - Manejo moderno de promesas
- ✅ **Event Listeners** - Manejo de eventos del DOM
- ✅ **CSS moderno** - Grid, Flexbox, variables CSS
- ✅ **Vite** - Hot Module Replacement (HMR)

## 📝 Notas

- Todos los métodos son asíncronos
- Los resultados se loguean en la consola del navegador
- La interfaz es responsive (mobile-friendly)
- Los módulos son independientes entre sí
- El código está completamente documentado con JSDoc

## 🐛 Depuración

Abre las DevTools del navegador (F12) para:

- Ver logs de las operaciones criptográficas
- Inspeccionar payloads enviados/recibidos
- Debuggear el código JavaScript
- Revisar errores de red

## 📦 Build

Para crear una versión optimizada para producción:

```bash
npm run build
```

Esto generará archivos minificados en `dist/` listos para desplegar en cualquier servidor web estático.
