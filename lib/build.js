import fs from 'node:fs/promises';

import htmlMinifier from 'html-minifier';
import CleanCss from 'clean-css';
import uglifyJs from 'uglify-js';

await fs.rm('./dist', { recursive: true }).catch(() => null);
await fs.mkdir('./dist', { recursive: true });

const sourceHtml = await fs.readFile('./src/index.html', 'utf-8');
const distHtml = htmlMinifier.minify(sourceHtml, { collapseWhitespace: true })
  .replace('<template', '\n<template')
  .replace('# Unified Page', '\n\n# Unified Page')
  .replace('</template>', '\n\n</template') + '\n';
await fs.writeFile('./dist/index.html', distHtml, 'utf-8');

const sourceCss = await fs.readFile('./src/index.css', 'utf-8');
const distCss = new CleanCss().minify(sourceCss).styles + '\n';
await fs.writeFile('./dist/index.css', distCss, 'utf-8');

const sourceJs = await fs.readFile('./src/index.js', 'utf-8');
const distJs = uglifyJs.minify(sourceJs, { toplevel: true, output: { quote_style: 1 } }).code + '\n';
await fs.writeFile('./dist/index.js', distJs, 'utf-8');
