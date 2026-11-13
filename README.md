# taanakoum.github.io

Portfolio of Mohammad Taan Al Akoum, AI & machine learning engineer (MSc AI, CentraleSupélec).
Live at https://taanakoum.github.io

Plain static files, no build step:

- `index.html`: the page (diagrams and charts are inline SVG)
- `styles.css`: styles, light and dark themes
- `script.js`: theme, menu, showcase, count-up numbers and the footer year
- `cv/index.html`: the CV as a web page (A4 layout); the PDF is printed from it
- `assets/`: CV (PDF), RAG platform screenshots, walker photo, favicon, social preview image
- `.nojekyll`: tells GitHub Pages to serve the files as they are

To preview locally, open `index.html` in a browser.

To rebuild the CV PDF after editing `cv/index.html`: serve the folder (`python -m http.server`) and print
`/cv/` to PDF from Chromium (A4, no margins, background graphics on), or use Playwright's `page.pdf`.
