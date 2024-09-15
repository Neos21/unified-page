import { unified } from 'https://esm.sh/unified@11?bundle';  // https://github.com/unifiedjs/unified?tab=readme-ov-file#install
import remarkParse from 'https://esm.sh/remark-parse@11?bundle';  // https://github.com/remarkjs/remark/tree/main/packages/remark-parse#install
import remarkGfm from 'https://esm.sh/remark-gfm@4?bundle';  // https://github.com/remarkjs/remark-gfm?tab=readme-ov-file#install
import remarkToc from 'https://esm.sh/remark-toc@9?bundle';  // https://github.com/remarkjs/remark-toc?tab=readme-ov-file#install
import remarkRehype from 'https://esm.sh/remark-rehype@11?bundle';  // https://github.com/remarkjs/remark-rehype?tab=readme-ov-file#install
import rehypeSlug from 'https://esm.sh/rehype-slug@6?bundle';  // https://github.com/rehypejs/rehype-slug?tab=readme-ov-file#install
import rehypeAutolinkHeadings from 'https://esm.sh/rehype-autolink-headings@7?bundle';  // https://github.com/rehypejs/rehype-autolink-headings?tab=readme-ov-file#install
import rehypePrism from 'https://esm.sh/rehype-prism@2?bundle';  // https://github.com/Val-istar-Guo/rehype-prism
import rehypeStringify from 'https://esm.sh/rehype-stringify@10?bundle';  // https://github.com/rehypejs/rehype/tree/main/packages/rehype-stringify#install

// Prism : よく使う言語は予めロードしておく
import 'https://esm.sh/prismjs@1/components/prism-bash';  // https://github.com/denoland/deno_blog/issues/15#issuecomment-1181923643
import 'https://esm.sh/prismjs@1/components/prism-markdown';
import 'https://esm.sh/prismjs@1/components/prism-powershell';

import prismComponents from 'https://esm.sh/prismjs@1/components/index';  // https://unpkg.com/browse/prismjs@1.29.0/components/
if(location.search.includes('all')) {  // `?all` とクエリパラメータを付けてアクセスした場合、全ての言語を読み込む
  await Promise.all(
    Object.keys(prismComponents.languages)
      .filter(languageName => !['meta', 'django'].includes(languageName))  // 読み込むとエラーになるモノを弾いておく
      .map(languageName => import(`https://esm.sh/prismjs@1/components/prism-${languageName}`).catch(() => null))  // 気休めの `catch`
  ).catch(() => null);
}

const setTheme = condition => {
  const nextTheme = condition ? 'dark' : 'light';
  document.documentElement.dataset.theme = nextTheme;
  localStorage.setItem('theme', nextTheme);
};

const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme:dark)');
darkModeMediaQuery.onchange = event => setTheme(event.matches);  // OS・ブラウザ設定変更時に動的にテーマを切り替える

const lastTheme = localStorage.getItem('theme');
if(lastTheme) {
  document.documentElement.dataset.theme = lastTheme;  // 2回目以降の訪問時の初期表示
}
else {
  setTheme(darkModeMediaQuery.matches);  // 初回訪問時の初期表示
}

document.body.insertAdjacentHTML('afterbegin', '<button type="button" id="unified-toggle-theme" accesskey="t"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 23 23" width="20" height="20"><path fill="#888888" d="M12,22 C17.5228475,22 22,17.5228475 22,12 C22,6.4771525 17.5228475,2 12,2 C6.4771525,2 2,6.4771525 2,12 C2,17.5228475 6.4771525,22 12,22 Z M12,20.5 L12,3.5 C16.6944204,3.5 20.5,7.30557963 20.5,12 C20.5,16.6944204 16.6944204,20.5 12,20.5 Z"/></svg></button>');
document.querySelector('#unified-toggle-theme').addEventListener('click', () => setTheme(document.documentElement.dataset.theme === 'light'));

const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkToc, { heading: '目次', tight: true })  // `## 目次` と書くとその下に Table of Contents を出力してくれる
  .use(remarkRehype, { fragment: true, allowDangerousHtml: true })  // `html`・`head`・`body` 要素を自動付与しない・`script` や `style` 要素が記述されていても流す
  .use(rehypeSlug)  // Slug を付与する
  .use(rehypeAutolinkHeadings, {  // 見出し要素に Slug のパーマリンク要素を追加する
    behavior: 'prepend',  // `prepend`・`append`・`wrap`・`before`・`after` で位置を選べる
    properties: {  // `a` 要素に付与する属性
      className: ['unified-header-link']
    },
    content: {  // hast Node として `a` 要素の子要素を定義する
      type: 'element',
      tagName: 'span',
      properties: {
        className: ['unified-header-link-mark']
      },
      children: []
    }
  })
  .use(rehypePrism)
  .use(rehypeStringify, { allowDangerousHtml: true });  // `script` や `style` 要素が記述されていても流す

const markdownElement = document.querySelector('template#markdown');
if(markdownElement) {
  markdownElement.style.display = 'none';  // 確実に非表示にしておく
  if(markdownElement.dataset.title) document.title = markdownElement.dataset.title;
  document.body.insertAdjacentHTML('afterbegin', `<div id="unified-container">${processor.processSync(markdownElement.innerHTML).value}</div>`);
}

// Export To Global
window.processor = processor;
