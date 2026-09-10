// Проверка механизма отказа от cookie на поддельных document и localStorage.
// Запуск: npm test

import assert from "node:assert/strict";

// ── поддельный браузер ───────────────────────────────────────────────
function makeBrowser(initialCookies = {}) {
  const jar = new Map(Object.entries(initialCookies));
  const store = new Map();
  const events = [];

  const documentStub = {
    get cookie() {
      return [...jar.entries()].map(([k, v]) => `${k}=${v}`).join("; ");
    },
    set cookie(value) {
      const [pair, ...attrs] = value.split(";").map((s) => s.trim());
      const eq = pair.indexOf("=");
      const name = pair.slice(0, eq);
      const expired = attrs.some(
        (a) => a.toLowerCase().startsWith("expires=") && new Date(a.slice(8)) < new Date(),
      );
      if (expired) jar.delete(name);
      else jar.set(name, pair.slice(eq + 1));
    },
  };

  const localStorageStub = {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
    get length() { return store.size; },
    key: (i) => [...store.keys()][i] ?? null,
  };
  // Object.keys(localStorage) должен возвращать ключи, как в браузере
  const localStorageProxy = new Proxy(localStorageStub, {
    ownKeys: () => [...store.keys()],
    getOwnPropertyDescriptor: () => ({ enumerable: true, configurable: true }),
    get: (t, p) => (typeof p === "string" && store.has(p) && !(p in t) ? store.get(p) : t[p]),
  });

  globalThis.document = documentStub;
  globalThis.window = {
    localStorage: localStorageProxy,
    location: { hostname: "physicsday.ru", pathname: "/masters" },
    dispatchEvent: (e) => { events.push(e); return true; },
  };
  globalThis.CustomEvent = class {
    constructor(type, init) { this.type = type; this.detail = init?.detail; }
  };
  return { jar, store, events };
}

const results = [];
const test = (name, fn) => {
  try { fn(); results.push(["OK  ", name]); }
  catch (e) { results.push(["FAIL", `${name} — ${e.message}`]); process.exitCode = 1; }
};

// ─────────────────────────────────────────────────────────────────────
const mod = await import("../.test-build/consent.js");

test("до ответа согласия нет", () => {
  makeBrowser();
  assert.equal(mod.readConsent(), null);
  assert.equal(mod.hasAnalyticsConsent(), false);
});

test("отказ сохраняется и переживает перезагрузку страницы", () => {
  makeBrowser();
  mod.saveConsent("declined");
  assert.equal(mod.readConsent(), "declined");
  assert.equal(mod.hasAnalyticsConsent(), false);
});

test("отказ удаляет уже поставленные необязательные cookie", () => {
  const { jar } = makeBrowser({ _ym_uid: "123", _ga: "GA1.2.3", csrftoken: "abc" });
  mod.saveConsent("declined");
  assert.equal(jar.has("_ym_uid"), false, "_ym_uid остался");
  assert.equal(jar.has("_ga"), false, "_ga остался");
});

test("строго необходимые cookie отказ не трогает — иначе сломаются формы", () => {
  const { jar } = makeBrowser({ csrftoken: "abc", sessionid: "xyz", _ym_uid: "123" });
  mod.saveConsent("declined");
  assert.equal(jar.get("csrftoken"), "abc");
  assert.equal(jar.get("sessionid"), "xyz");
});

test("согласие ничего не удаляет", () => {
  const { jar } = makeBrowser({ _ym_uid: "123", csrftoken: "abc" });
  mod.saveConsent("accepted");
  assert.equal(jar.get("_ym_uid"), "123");
  assert.equal(mod.hasAnalyticsConsent(), true);
});

test("cookie, поставленная после отказа, удаляется на следующей загрузке", () => {
  const { jar } = makeBrowser();
  mod.saveConsent("declined");
  jar.set("_ym_uid", "поставлено позже");       // скрипт сработал уже после отказа
  mod.applyConsent(mod.readConsent());          // следующая загрузка страницы
  assert.equal(jar.has("_ym_uid"), false);
});

test("пока ответа нет, необязательные cookie тоже не сохраняются", () => {
  const { jar } = makeBrowser({ _ga: "GA1.2.3" });
  mod.applyConsent(null);
  assert.equal(jar.has("_ga"), false);
});

test("отказ чистит localStorage, но помнит само решение", () => {
  const { store } = makeBrowser();
  store.set("какой-то-трекер", "данные");
  mod.saveConsent("declined");
  assert.equal(store.has("какой-то-трекер"), false);
  assert.equal(mod.readConsent(), "declined");
});

test("ответ из старой версии баннера не спрашивается заново", () => {
  const { store } = makeBrowser();
  store.set("cookiesAccepted", "false");
  assert.equal(mod.readConsent(), "declined");
  store.clear();
  store.set("cookiesAccepted", "true");
  assert.equal(mod.readConsent(), "accepted");
});

test("решение можно изменить с отказа на согласие и обратно", () => {
  makeBrowser();
  mod.saveConsent("accepted");
  assert.equal(mod.readConsent(), "accepted");
  mod.saveConsent("declined");
  assert.equal(mod.readConsent(), "declined");
});

test("запрет на хранение данных не считается согласием", () => {
  makeBrowser();
  Object.defineProperty(globalThis.window, "localStorage", {
    get() { throw new Error("доступ к хранилищу запрещён"); },
  });
  assert.equal(mod.readConsent(), null);
  assert.equal(mod.hasAnalyticsConsent(), false);
});

test("смена решения рассылает событие — карта реагирует без перезагрузки", () => {
  const { events } = makeBrowser();
  mod.saveConsent("accepted");
  const changed = events.filter((e) => e.type === mod.CONSENT_CHANGE_EVENT);
  assert.equal(changed.length, 1, "событие не отправлено");
  assert.equal(changed[0].detail, "accepted");

  mod.saveConsent("declined");
  const last = events.filter((e) => e.type === mod.CONSENT_CHANGE_EVENT).at(-1);
  assert.equal(last.detail, "declined");
});

test("карта загружается только при согласии", () => {
  makeBrowser();
  // Логика MapEmbed: iframe рендерится, только если hasAnalyticsConsent().
  assert.equal(mod.hasAnalyticsConsent(), false, "без ответа карта грузиться не должна");
  mod.saveConsent("declined");
  assert.equal(mod.hasAnalyticsConsent(), false, "после отказа карта грузиться не должна");
  mod.saveConsent("accepted");
  assert.equal(mod.hasAnalyticsConsent(), true);
});

console.log(results.map(([s, n]) => `${s} ${n}`).join("\n"));
console.log(`\nвсего: ${results.length}, провалено: ${results.filter(r => r[0] === "FAIL").length}`);
