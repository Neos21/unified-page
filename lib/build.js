import fs from 'node:fs/promises';

import htmlMinifier from 'html-minifier';
import CleanCss from 'clean-css';
import uglifyJs from 'uglify-js';

const distPath = './docs';

await fs.rm(distPath, { recursive: true }).catch(() => null);
await fs.mkdir(distPath, { recursive: true });

const sourceHtml = await fs.readFile('./src/index.html', 'utf-8');
const distHtml = htmlMinifier.minify(sourceHtml, { collapseWhitespace: true })
  .replace('<template', '\n<template')
  .replace('# Unified Page', '\n\n# Unified Page')
  .replace('</template>', '\n\n</template');
const gitHubPagesIndexHtml = distHtml.replace('# Unified Page', `# Unified Page

  - [Example Page](./example.html)
  - [Single HTML Version](./single.html)
  
  ---
  
  - [Neo's World](https://neos21.net/)
  - [GitHub - Neos21](https://github.com/Neos21/)
  - [GitHub - unified-page](https://github.com/Neos21/unified-page)
  - [GitHub Pages - unified-page : Unified Page](https://neos21.github.io/unified-page)`);
await fs.writeFile(`${distPath}/index.html`, gitHubPagesIndexHtml, 'utf-8');

const sourceCss = await fs.readFile('./src/index.css', 'utf-8');
const distCss = new CleanCss().minify(sourceCss).styles;
await fs.writeFile(`${distPath}/index.css`, distCss, 'utf-8');

const sourceJs = await fs.readFile('./src/index.js', 'utf-8');
const distJs = uglifyJs.minify(sourceJs, { toplevel: true, output: { quote_style: 1 } }).code;
await fs.writeFile(`${distPath}/index.js`, distJs, 'utf-8');

// Example
await fs.copyFile('./src/example.html', `${distPath}/example.html`);

// Single File
const singleHtml = distHtml
  .replace('<link rel="stylesheet" href="index.css">', `<style>${distCss}</style>`)
  .replace('<script type="module" src="index.js"></script>', `<script type="module">${distJs}</script>`);
await fs.writeFile(`${distPath}/single.html`, singleHtml, 'utf-8');
