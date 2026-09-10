// Проверка нормализации адресов файлов.
// Запуск: npm test

import assert from "node:assert/strict";

const { toSitePath } = await import("../.test-build/media.js");

const results = [];
const test = (name, fn) => {
  try { fn(); results.push(["OK  ", name]); }
  catch (e) { results.push(["FAIL", `${name} — ${e.message}`]); process.exitCode = 1; }
};

test("внутренний адрес docker-сети превращается в путь от корня", () => {
  assert.equal(
    toSitePath("http://backend:8000/media/seed/program/institutes.jpg"),
    "/media/seed/program/institutes.jpg",
  );
});

test("публичный домен тоже сворачивается в путь", () => {
  assert.equal(
    toSitePath("https://physicsday.ru/media/workshops_images/elmag.jpg"),
    "/media/workshops_images/elmag.jpg",
  );
});

test("статика админки обрабатывается так же", () => {
  assert.equal(
    toSitePath("http://backend:8000/static/admin/css/base.css"),
    "/static/admin/css/base.css",
  );
});

test("готовый путь остаётся неизменным", () => {
  assert.equal(toSitePath("/media/seed/partners/binp.jpg"), "/media/seed/partners/binp.jpg");
});

test("ссылка партнёра на чужой сайт не трогается", () => {
  // У партнёра в адресе сайта вполне может встретиться /media/.
  assert.equal(toSitePath("https://www.inp.nsk.su/"), "https://www.inp.nsk.su/");
  assert.equal(
    toSitePath("https://example.com/press/media/logo.png"),
    "https://example.com/press/media/logo.png",
    "путь /media/ не в начале — это чужая ссылка, а не наш файл",
  );
});

test("пустое значение не превращается в undefined в разметке", () => {
  assert.equal(toSitePath(null), "");
  assert.equal(toSitePath(undefined), "");
  assert.equal(toSitePath(""), "");
});

console.log(results.map(([s, n]) => `${s} ${n}`).join("\n"));
console.log(`\nвсего: ${results.length}, провалено: ${results.filter((r) => r[0] === "FAIL").length}`);
