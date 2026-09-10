/**
 * Согласие на использование cookie.
 *
 * Решение посетителя хранится в localStorage и применяется на каждой
 * загрузке страницы, а не только в момент нажатия кнопки. При отказе
 * все необязательные cookie удаляются — в том числе те, что мог
 * поставить сторонний скрипт, добавленный позже.
 *
 * Сейчас публичная часть сайта не ставит ни одной необязательной cookie:
 * csrftoken выдаётся только на странице входа в админку, sessionid —
 * только после входа. Поэтому отказ ничего видимого не отключает,
 * но механизм рабочий: как только появится счётчик посещений или
 * пиксель, его нужно обернуть в hasAnalyticsConsent().
 */

export type ConsentChoice = "accepted" | "declined";

const STORAGE_KEY = "cookieConsent";
/** Ключ из первой версии баннера: 'true' | 'false'. */
const LEGACY_STORAGE_KEY = "cookiesAccepted";

/**
 * Cookie, без которых сайт не работает. Их отказ не удаляет:
 * законодательство о cookie на строго необходимые не распространяется.
 *
 * - csrftoken — защита форм от подделки запросов;
 * - sessionid — вход в админку (HttpOnly, из JavaScript всё равно недоступна).
 */
const ESSENTIAL_COOKIES = ["csrftoken", "sessionid"];

/** Ключи localStorage, которые переживают отказ. */
const ESSENTIAL_STORAGE_KEYS = [STORAGE_KEY, LEGACY_STORAGE_KEY];

function safeLocalStorage(): Storage | null {
  // В режиме приватного просмотра и при запрете сайту хранить данные
  // обращение к localStorage выбрасывает исключение.
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

/** Что выбрал посетитель, или null — если ещё не выбирал. */
export function readConsent(): ConsentChoice | null {
  if (typeof window === "undefined") return null;

  const storage = safeLocalStorage();
  if (!storage) return null;

  const stored = storage.getItem(STORAGE_KEY);
  if (stored === "accepted" || stored === "declined") return stored;

  // Посетители, ответившие в старой версии баннера, не спрашиваются заново.
  const legacy = storage.getItem(LEGACY_STORAGE_KEY);
  if (legacy === "true") return "accepted";
  if (legacy === "false") return "declined";

  return null;
}

export function saveConsent(choice: ConsentChoice): void {
  const storage = safeLocalStorage();
  try {
    storage?.setItem(STORAGE_KEY, choice);
    storage?.removeItem(LEGACY_STORAGE_KEY);
  } catch {
    // Хранить решение негде — баннер появится снова. Это лучше, чем
    // молча считать, что согласие получено.
  }
  applyConsent(choice);
}

/** Разрешил ли посетитель необязательные cookie. Отсутствие ответа — не разрешил. */
export function hasAnalyticsConsent(): boolean {
  return readConsent() === "accepted";
}

/**
 * Удаляет все cookie, кроме строго необходимых.
 *
 * Браузер удаляет cookie только при точном совпадении пути и домена,
 * поэтому перебираются вероятные сочетания. HttpOnly-cookie из
 * JavaScript недоступны — но необязательных среди них у нас нет.
 */
export function clearNonEssentialCookies(): void {
  if (typeof document === "undefined") return;

  const names = document.cookie
    .split(";")
    .map((pair) => pair.split("=")[0].trim())
    .filter((name) => name && !ESSENTIAL_COOKIES.includes(name));

  if (names.length === 0) return;

  const host = window.location.hostname;
  const parts = host.split(".");
  const domains: (string | null)[] = [null, host, `.${host}`];
  if (parts.length > 2) {
    const base = parts.slice(-2).join(".");
    domains.push(base, `.${base}`);
  }

  const paths = ["/", window.location.pathname];

  for (const name of names) {
    for (const path of paths) {
      for (const domain of domains) {
        document.cookie =
          `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}` +
          (domain ? `; domain=${domain}` : "");
      }
    }
  }
}

/** Очищает localStorage от всего, кроме самого решения о cookie. */
function clearNonEssentialStorage(): void {
  const storage = safeLocalStorage();
  if (!storage) return;
  try {
    for (const key of Object.keys(storage)) {
      if (!ESSENTIAL_STORAGE_KEYS.includes(key)) storage.removeItem(key);
    }
  } catch {
    // Нечего чистить.
  }
}

/**
 * Приводит состояние браузера в соответствие с решением.
 * Вызывается и при нажатии кнопки, и на каждой загрузке страницы.
 */
export function applyConsent(choice: ConsentChoice | null): void {
  if (choice === "accepted") return;

  // И при отказе, и пока ответа нет, необязательные cookie не нужны:
  // до получения согласия ставить их нельзя.
  clearNonEssentialCookies();
  if (choice === "declined") clearNonEssentialStorage();
}

/** Событие, которым подвал просит баннер открыться заново. */
export const CONSENT_OPEN_EVENT = "cookie-consent:open";

export function openConsentBanner(): void {
  window.dispatchEvent(new CustomEvent(CONSENT_OPEN_EVENT));
}
