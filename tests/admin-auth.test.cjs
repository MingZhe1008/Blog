const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");

test("admin auth uses an in-page login and secure session cookie", () => {
  const middleware = fs.readFileSync("src/middleware.ts", "utf8");
  const form = fs.readFileSync("src/app/admin-login/login-form.tsx", "utf8");
  const action = fs.readFileSync("src/app/admin-login/actions.ts", "utf8");
  assert.doesNotMatch(middleware, /WWW-Authenticate/);
  assert.match(middleware, /\/admin-login/);
  assert.match(middleware, /BLOG_ADMIN_SESSION/);
  assert.match(form, /requestSubmit/);
  assert.match(form, /defaultValue=\{developmentPassword\}/);
  assert.match(action, /httpOnly:\s*true/);
  assert.match(action, /sameSite:\s*"lax"/);
  assert.match(action, /startsWith\("\/admin"\)/);
});
