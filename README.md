# Danei landing page

Landing page estática para GitHub Pages, con CSS común, Eina 04, temas claro/oscuro y selector de idioma `pt / en / es`.

## Uso

No requiere instalación ni compilación. Publicá la carpeta directamente en GitHub Pages.

Para probar localmente:

```bash
python3 -m http.server 8000
```

Abrí `http://localhost:8000`.

## Estilos

- `styles/fonts.css`: fuentes y tipografía semántica por etiquetas HTML.
- `styles/main.css`: layout, colores, espacios, bordes, sombras y animaciones.

## Logo

El logo está en `assets/vectors/danei.svg`. Su color se controla con `--logo-color` en `styles/main.css`.

## Capturas

Colocá en `assets/images`:

- `panel-light.png`
- `panel-dark.png`
- `history-light.png`
- `history-dark.png`
- `category-light.png`
- `category-dark.png`

## Fuentes

Colocá en `assets/fonts`:

- `eina-light.woff2`
- `eina-lightitalic.woff2`
- `eina-regular.woff2`
- `eina-italic.woff2`
- `eina-semibold.woff2`
- `eina-semibolditalic.woff2`
- `eina-bold.woff2`
- `eina-bolditalic.woff2`
