// Проверка механизма согласия на cookie на поддельных document,
// localStorage и sessionStorage.
// Запуск: npm test

import assert from "node:assert/strict";

// ── поддельный браузер ───────────────────────────────────────────────
function makeStorage(map) {
  const target = {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => map.set(k, String(v)),
    removeItem: (k) => map.delete(k),
    clear: () => map.clear(),
    get length() { return map.size; },
    key: (i) => [...map.keys()][i] ?? null,
  };
  // Object.keys(storage) должен перечислять ключи, как в браузере
  return new Proxy(target, {
    ownKeys: () => [...map.keys()],
    getOwnPropertyDescriptor: () => ({ enumerable: true, configurable: true }),
    get: (t, p) => (typeof p === "string" && map.has(p) && !(p in t) ? map.get(p) : t[p]),
  });
}

function makeBrowser({ cookies = {}, local = new Map(), session = new Map() } = {}) {
  const jar = new Map(Object.entries(cookies));
  const events = [];

  globalThis.document = {
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

  globalThis.window = {
    localStorage: makeStorage(local),
    sessionStorage: makeStorage(session),
    location: { hostname: "physicsday.ru", pathname: "/masters" },
    dispatchEvent: (e) => { events.push(e); return true; },
  };
  globalThis.CustomEvent = class {
    constructor(type, init) { this.type = type; this.detail = init?.detail; }
  };

  return {
    jar, local, session, events,
    /** Обновление страницы: сохраняется и localStorage, и вкладка. */
    reload: () => makeBrowser({ cookies: Object.fromEntries(jar), local, session }),
    /** Новый заход: вкладку закрыли, sessionStorage очищен. */
    newVisit: () => makeBrowser({ cookies: Object.fromEntries(jar), local }),
  };
}

const results = [];
const test = (name, fn) => {
  try { fn(); results.push(["OK  ", name]); }
  catch (e) { results.push(["FAIL", `${name} — ${e.message}`]); process.exitCode = 1; }
};

const mod = await import("../.test-build/consent.js");

// ── состояние решения ────────────────────────────────────────────────
test("до ответа согласия нет", () => {
  makeBrowser();
  assert.equal(mod.readConsent(), null);
  assert.equal(mod.hasAnalyticsConsent(), false);
});

test("согласие хранится долго и переживает новый заход", () => {
  const b = makeBrowser();
  mod.saveConsent("accepted");
  assert.equal(mod.readConsent(), "accepted");
  b.newVisit();
  assert.equal(mod.readConsent(), "accepted", "у согласившегося баннер не должен появляться снова");
});

test("отказ НЕ попадает в localStorage", () => {
  const b = makeBrowser();
  mod.saveConsent("declined");
  assert.equal(b.local.has("cookieConsent"), false, "отказ записан в localStorage");
  assert.equal(b.session.get("cookieConsent"), "declined", "отказ не записан в sessionStorage");
});

test("внутри визита обновление страницы не сбрасывает отказ", () => {
  const b = makeBrowser();
  mod.saveConsent("declined");
  b.reload();
  assert.equal(mod.readConsent(), "declined", "после F5 баннер спросил бы снова");
});

test("на следующий заход отказ спрашивается снова", () => {
  const b = makeBrowser();
  mod.saveConsent("declined");
  b.newVisit();
  assert.equal(mod.readConsent(), null, "отказ пережил закрытие вкладки");
});

test("решение можно изменить с отказа на согласие и обратно", () => {
  const b = makeBrowser();
  mod.saveConsent("accepted");
  assert.equal(mod.readConsent(), "accepted");
  mod.saveConsent("declined");
  assert.equal(mod.readConsent(), "declined");
  assert.equal(b.local.has("cookieConsent"), false, "согласие осталось в localStorage после отказа");
});

// ── cookie ───────────────────────────────────────────────────────────
test("отказ удаляет уже поставленные необязательные cookie", () => {
  const b = makeBrowser({ cookies: { _ym_uid: "123", _ga: "GA1.2.3", csrftoken: "abc" } });
  mod.saveConsent("declined");
  assert.equal(b.jar.has("_ym_uid"), false);
  assert.equal(b.jar.has("_ga"), false);
});

test("строго необходимые cookie отказ не трогает — иначе сломаются формы", () => {
  const b = makeBrowser({ cookies: { csrftoken: "abc", sessionid: "xyz", _ym_uid: "123" } });
  mod.saveConsent("declined");
  assert.equal(b.jar.get("csrftoken"), "abc");
  assert.equal(b.jar.get("sessionid"), "xyz");
});

test("согласие ничего не удаляет", () => {
  const b = makeBrowser({ cookies: { _ym_uid: "123", csrftoken: "abc" } });
  mod.saveConsent("accepted");
  assert.equal(b.jar.get("_ym_uid"), "123");
  assert.equal(mod.hasAnalyticsConsent(), true);
});

test("cookie, поставленная после отказа, удаляется на следующей загрузке", () => {
  const b = makeBrowser();
  mod.saveConsent("declined");
  b.jar.set("_ym_uid", "поставлено позже");
  mod.applyConsent(mod.readConsent());
  assert.equal(b.jar.has("_ym_uid"), false);
});

test("пока ответа нет, необязательные cookie тоже не сохраняются", () => {
  const b = makeBrowser({ cookies: { _ga: "GA1.2.3" } });
  mod.applyConsent(null);
  assert.equal(b.jar.has("_ga"), false);
});

test("отказ чистит localStorage, но помнит само решение", () => {
  const b = makeBrowser();
  b.local.set("какой-то-трекер", "данные");
  mod.saveConsent("declined");
  assert.equal(b.local.has("какой-то-трекер"), false);
  assert.equal(mod.readConsent(), "declined");
});

// ── совместимость и краевые случаи ───────────────────────────────────
test("согласие из старой версии баннера не спрашивается заново", () => {
  makeBrowser({ local: new Map([["cookiesAccepted", "true"]]) });
  assert.equal(mod.readConsent(), "accepted");
});

test("отказ из старой версии переносится в сессию и стирается из localStorage", () => {
  const b = makeBrowser({ local: new Map([["cookiesAccepted", "false"]]) });
  assert.equal(mod.readConsent(), "declined", "старый отказ не должен молча превращаться в согласие");
  assert.equal(b.local.has("cookiesAccepted"), false, "старый ключ остался в localStorage");
  b.newVisit();
  assert.equal(mod.readConsent(), null, "на следующий заход должен спросить снова");
});

test("запрет на хранение данных не считается согласием", () => {
  makeBrowser();
  Object.defineProperty(globalThis.window, "localStorage", {
    get() { throw new Error("доступ к хранилищу запрещён"); },
  });
  Object.defineProperty(globalThis.window, "sessionStorage", {
    get() { throw new Error("доступ к хранилищу запрещён"); },
  });
  assert.equal(mod.readConsent(), null);
  assert.equal(mod.hasAnalyticsConsent(), false);
});

// ── реакция интерфейса ───────────────────────────────────────────────
test("смена решения рассылает событие — карта реагирует без перезагрузки", () => {
  const b = makeBrowser();
  mod.saveConsent("accepted");
  const changed = b.events.filter((e) => e.type === mod.CONSENT_CHANGE_EVENT);
  assert.equal(changed.length, 1, "событие не отправлено");
  assert.equal(changed[0].detail, "accepted");

  mod.saveConsent("declined");
  const last = b.events.filter((e) => e.type === mod.CONSENT_CHANGE_EVENT).at(-1);
  assert.equal(last.detail, "declined");
});

test("карта загружается только при согласии", () => {
  makeBrowser();
  assert.equal(mod.hasAnalyticsConsent(), false, "без ответа карта грузиться не должна");
  mod.saveConsent("declined");
  assert.equal(mod.hasAnalyticsConsent(), false, "после отказа карта грузиться не должна");
  mod.saveConsent("accepted");
  assert.equal(mod.hasAnalyticsConsent(), true);
});

console.log(results.map(([s, n]) => `${s} ${n}`).join("\n"));
console.log(`\nвсего: ${results.length}, провалено: ${results.filter((r) => r[0] === "FAIL").length}`);
