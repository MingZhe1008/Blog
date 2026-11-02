import test from "node:test";
import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import { sitePath, appPath, contentUrl, adminReturnPath, BASE_PATH } from "../src/lib/site-paths.ts";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
registerHooks({ resolve(specifier,context,nextResolve) {
  try{return nextResolve(specifier,context);}catch(error){if(specifier.startsWith('./')&&context.parentURL?.includes('/src/lib/'))return nextResolve(specifier+'.ts',context);throw error;}
} });
const { default:rehypeSitePaths }=await import('../src/lib/rehype-site-paths.ts');

test("public routes and assets use one base path without double prefixes",()=>{
  assert.equal(BASE_PATH,'/blog');
  for(const path of ['/','/admin','/articles/test','/notes/1','/api/search?q=AI','/uploads/a.png','/_next/static/app.js']){
    const mounted=sitePath(path);assert.ok(mounted.startsWith('/blog'));assert.equal(sitePath(mounted),mounted);assert.equal(appPath(mounted),path);
  }
  for(const path of ['https://example.com/x','//cdn.example.com/a.png','#title','image.png','mailto:me@example.com'])assert.equal(sitePath(path),path);
  assert.equal(sitePath('/blogger'),'/blog/blogger');
});
test("stored root URLs and old article URLs resolve without rewriting their source",()=>{
  assert.equal(contentUrl('/blog/hello-world'),'/blog/articles/hello-world');
  assert.equal(contentUrl('/blog/hello?tag=x#title'),'/blog/articles/hello?tag=x#title');
  assert.equal(contentUrl('/notes/7'),'/blog/notes/7');
  assert.equal(contentUrl('/blog/articles/test'),'/blog/articles/test');
  assert.equal(contentUrl('/blog'),'/blog');
  assert.equal(contentUrl('/blog/'),'/blog/');
  assert.equal(contentUrl('https://other.test/blog/x'),'https://other.test/blog/x');
});
test("login accepts only management return destinations and rejects encoded escapes",()=>{
  assert.equal(adminReturnPath('/admin/editor/2?tab=preview'),'/blog/admin/editor/2?tab=preview');
  assert.equal(adminReturnPath('/blog/admin/images'),'/blog/admin/images');
  for(const input of ['https://evil.test','//evil.test','/blog//evil.test','/administer','/admin/../../other','/admin\\evil','/admin/%252e%252e/other','/admin%0d%0aLocation:evil','/%ZZ'])assert.equal(adminReturnPath(input),'/blog/admin');
});
test("Markdown render output prefixes legacy images and links while keeping source unchanged",async()=>{
  const source='![legacy](/uploads/a.png) [article](/blog/example) [note](/notes/1) [external](https://example.com)';
  const result=String(await unified().use(remarkParse).use(remarkRehype).use(rehypeSitePaths).use(rehypeStringify).process(source));
  assert.ok(result.includes('src="/blog/uploads/a.png"'));assert.ok(result.includes('href="/blog/articles/example"'));assert.ok(result.includes('href="/blog/notes/1"'));assert.ok(result.includes('href="https://example.com"'));
  assert.ok(source.includes('](/uploads/a.png)'));
});
