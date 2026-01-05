# Examples

Este directorio incluye ejemplos de uso del paquete `crypto` en distintos entornos.

## Contenido

- `angular` — Demo en Angular (cliente web usando los módulos del paquete).
- `reactjs` — Demo en React (Vite).
- `vanilla` — Demo con JavaScript plano (Vite).
- `servidor` — Ejemplo de servidor Node.js que muestra rutas y uso de claves.

## Instrucciones generales

Para cada ejemplo: entra en la carpeta del ejemplo, instala dependencias y arranca la aplicación.

Ejemplos de comandos:

```bash
cd examples/angular
npm install
npm run start

cd examples/reactjs
pnpm install
pnpm run dev

cd examples/vanilla
npm install
npm run dev

cd examples/servidor
npm install
npm run start
```

## Notas importantes

- Revisa las carpetas de claves en `examples/servidor` si el servidor las necesita (p. ej. `keys-ec-der`, `keys-rsa-der`, `key-hmac`).
- Algunos ejemplos usan Vite o Angular CLI; los comandos de arranque pueden variar (consulta el `package.json` de cada ejemplo).

## Contribución

Si añades un ejemplo nuevo, agrega una carpeta con su propio `README.md` y actualiza este archivo con una línea descriptiva.
