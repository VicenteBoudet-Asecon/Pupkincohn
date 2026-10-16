# Pupkin Cohn — sitio web

Sitio estático (HTML + CSS + JavaScript, sin dependencias ni paso de compilación) para **pupkincohn.com**.
Bilingüe español / inglés con selector **ES | EN**.

## Estructura

```
index.html                 Página única (el español es el texto original)
assets/
  css/styles.css           Sistema de diseño y estilos
  js/main.js               Comportamiento: idioma, menú, acordeón, formulario…
  js/lang-en.js            Traducciones al inglés (+ textos que solo usa JavaScript)
  fonts/                   Jost (variable), alojada localmente
  img/                     Logo vectorial, favicon, imagen para redes (og-image.png) y fotos del hero/firma
Logo/                      Originales de marca (.ai / .png). Solo en el equipo local: no se publica en GitHub
robots.txt, sitemap.xml
```

## Cómo editar textos

Cada texto traducible tiene un atributo `data-i18n="clave"` en `index.html`.

1. Cambie el texto en **español** directamente en `index.html`.
2. Cambie su equivalente en **inglés** en `assets/js/lang-en.js` (misma clave).

Para agregar un texto nuevo: añada `data-i18n="mi.clave"` al elemento y la clave `'mi.clave'` al diccionario inglés.
Para traducir un atributo (p. ej. `aria-label`, `placeholder`, `content`): `data-i18n-attr="aria-label:mi.clave"`.

El idioma inicial se decide así: `?lang=en` en la URL → idioma elegido antes por la persona → idioma del navegador.

## Pendientes antes de publicar

Buscar `TODO` en `index.html`. Hoy el sitio contiene contenido de ejemplo que **debe revisarse o reemplazarse**:

- **Fotografías** (`assets/img/hero-*.jpg` y `firma-*.jpg`): son fotos de uso libre de [Pexels](https://www.pexels.com/) puestas como marcador de posición (fotos *Low-Angle Photo of Glass Buildings*, de Brett Sayles, y *Blue Glass Building*, de Erik Petkov). La licencia de Pexels permite uso comercial sin atribución, pero conviene reemplazarlas por fotografías propias del estudio (oficina, equipo). Mantenga los mismos nombres de archivo o cambie las rutas en `index.html`.
- **Mensajes del hero**: son tres y rotan solos cada 7 s (con botón de pausa; no rotan si la persona pidió menos movimiento). Se editan en `index.html` (`hero.title`, `hero.s2.t`, `hero.s3.t` y sus textos).
- **Equipo** (sección 04): nombres, cargos, reseñas y, si se desea, fotografías. Hoy son tarjetas de ejemplo.
- **Datos de contacto**: se asumió `contacto@pupkincohn.com`; falta confirmar el correo y agregar teléfono y dirección.
- **Descripciones de áreas de práctica** y textos de la firma: son una propuesta redactada a partir del giro (estudio legal tributario); deben ser validados por los socios.
- **Formulario de contacto**: sin servidor, abre el correo del visitante con el mensaje prellenado. Para recibirlo directo, indique un servicio en `FORM_ENDPOINT` (inicio de `assets/js/main.js`), por ejemplo Formspree.
- **Política de privacidad / aviso legal**: el formulario recoge datos personales; se recomienda publicar una política de privacidad y enlazarla en el pie de página.

## Probar localmente

```bash
python -m http.server 8000
# abrir http://localhost:8000
```

## Publicar

Es un sitio estático: sirve cualquier hosting (Netlify, Vercel, Cloudflare Pages, GitHub Pages, cPanel…).
Suba el contenido de esta carpeta (sin `Logo/` si no desea exponer los originales) a la raíz del dominio.

## Marca y estilo

- Diseño claro y limpio: fondo blanco y gris azulado suave, con el azul corporativo **#3B6FAB** (tomado del logo) como único acento.
- Una sola tipografía, **Jost** (sans geométrica, cercana a la del logotipo), en ancho normal y pesos regulares. No usa cursivas: el énfasis es el color azul.
- Esquinas casi rectas, en línea con el rectángulo del monograma PKCN.
- El hero admite fácilmente una fotografía a ancho completo (como en bovemontero.com) cuando existan imágenes propias del estudio.
