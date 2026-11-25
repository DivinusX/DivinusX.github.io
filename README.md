# Pixel Decoder · by Mr. Pixel

🌐 **https://mrpixeldecoder.github.io/**

Codifica y decodifica links y texto en **Base64** o **URL (%)**, gratis y 100% en el navegador.
Es un sitio estático (HTML + CSS + JS, sin servidor ni dependencias), listo para GitHub Pages.

## Funciones
- Codificar / decodificar en Base64 (UTF-8; acepta variante URL-safe y sin "=") o en formato URL (%)
- Resultado en vivo, botón Copiar y "Usar como entrada"
- Detecta los links del resultado decodificado (Abrir / Copiar)
- Opción para procesar varias líneas por separado
- Modo noche y link para compartir: `?d=<base64>`
- Discord de Mr. Pixel: https://discord.gg/MxjpNs7cCk

## Publicar gratis en GitHub Pages
1. Crea un repositorio público en GitHub (por ejemplo `pixel-decoder`).
2. Sube el contenido de esta carpeta (index.html, styles.css, app.js, assets/, .nojekyll).
3. En el repo: **Settings → Pages → Source: Deploy from a branch → Branch: `main` / `(root)` → Save**.
4. En 1–2 minutos queda en `https://TU-USUARIO.github.io/pixel-decoder/`.
   - Si llamas al repo `TU-USUARIO.github.io`, la web queda en la raíz: `https://TU-USUARIO.github.io/`.

## Probar en local
```sh
python3 -m http.server 8000
# abre http://localhost:8000
```
