/**
 * Загрузка содержимого сайта из Django.
 *
 * Запрос идёт на сервере Next по внутренней docker-сети и кешируется
 * на минуту (ISR): правка в админке появляется на сайте без пересборки.
 *
 * Если бэкенд недоступен, страницы отдаются с запасным содержимым —
 * лучше слегка устаревшая дата, чем пустая главная.
 */

export interface RegistrationState {
  slug: string;
  status: "before" | "open" | "after";
  is_open: boolean;
  closed_title: string;
  message: string;
  opens_at: string | null;
  closes_at: string | null;
}

export interface SiteSettings {
  event_date: string;
  event_time: string;
  event_place: string;
  event_description: string;
  olympiad_dates: string;
  olympiad_format: string;
  olympiad_results_date: string;
  show_olympiad_results: boolean;
  show_awards_ceremony: boolean;
  awards_ceremony_html: string;
  contact_person: string;
  contact_email: string;
  contact_phone: string;
  footer_copyright: string;
  consent_text: string;
  privacy_policy_url: string;
}

export interface ProgramItem {
  id: number;
  title: string;
  image: string;
  href: string;
  ordering: number;
}

export interface Partner {
  id: number;
  name: string;
  logo: string;
  website: string;
}

export interface SocialLink {
  id: number;
  title: string;
  url: string;
}

export interface OlympiadResults {
  year: number;
  intro: string;
  body_html: string;
}

export interface PageSeo {
  slug: string;
  title: string;
  description: string;
  og_title: string;
  og_description: string;
  keywords: string;
}

export interface SiteContent {
  settings: SiteSettings;
  registration: Record<string, RegistrationState>;
  program: ProgramItem[];
  partners: Partner[];
  socials: SocialLink[];
  olympiad_results: OlympiadResults | null;
  seo: Record<string, PageSeo>;
}

const INTERNAL_API =
  process.env.API_URL_INTERNAL ?? "http://backend:8000/api";

/** Раз в минуту страница пересобирается с новыми данными из админки. */
export const REVALIDATE_SECONDS = 60;

const CLOSED: RegistrationState = {
  slug: "",
  status: "after",
  is_open: false,
  closed_title: "Регистрация закрыта",
  message: "Регистрация временно недоступна. Попробуйте позже.",
  opens_at: null,
  closes_at: null,
};

/** Минимальное содержимое на случай, если бэкенд не отвечает. */
export const FALLBACK_CONTENT: SiteContent = {
  settings: {
    event_date: "2026-09-27",
    event_time: "11:00",
    event_place: "Главный корпус НГУ (Пирогова, 2)",
    event_description:
      'Фестиваль науки "ФизФест" — масштабное событие, организуемое студентами и молодыми учеными Новосибирского государственного университета с целью популяризации физики среди школьников и общественности.',
    olympiad_dates: "10 — 12 октября 2026",
    olympiad_format: "дистанционный",
    olympiad_results_date: "не позднее 2 ноября 2026",
    show_olympiad_results: false,
    show_awards_ceremony: false,
    awards_ceremony_html: "",
    contact_person: "Котельникова Мария Станиславовна",
    contact_email: "m.kotelnikova@g.nsu.ru",
    contact_phone: "+7-913-921-00-54",
    footer_copyright: "© Физический факультет НГУ",
    consent_text: "Я даю согласие на обработку персональных данных",
    privacy_policy_url: "",
  },
  registration: {
    physicsday: { ...CLOSED, slug: "physicsday" },
    workshops: { ...CLOSED, slug: "workshops" },
    excursions: { ...CLOSED, slug: "excursions" },
    olympiads: { ...CLOSED, slug: "olympiads" },
  },
  program: [],
  partners: [],
  socials: [],
  olympiad_results: null,
  seo: {},
};

async function fetchJson<T>(path: string): Promise<T | null> {
  try {
    const response = await fetch(`${INTERNAL_API}${path}`, {
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (!response.ok) {
      console.error(`Бэкенд ответил ${response.status} на ${path}`);
      return null;
    }
    return (await response.json()) as T;
  } catch (error) {
    console.error(`Бэкенд недоступен (${path}):`, error);
    return null;
  }
}

export async function getSiteContent(): Promise<SiteContent> {
  const content = await fetchJson<SiteContent>("/content/");
  return content ?? FALLBACK_CONTENT;
}

export function getRegistration(
  content: SiteContent,
  slug: string,
): RegistrationState {
  return content.registration?.[slug] ?? { ...CLOSED, slug };
}

/** Дата фестиваля прописью: «27 сентября 2026». */
export function formatEventDate(isoDate: string): string {
  const months = [
    "января", "февраля", "марта", "апреля", "мая", "июня",
    "июля", "августа", "сентября", "октября", "ноября", "декабря",
  ];
  const [year, month, day] = isoDate.split("-").map(Number);
  if (!year || !month || !day) return isoDate;
  return `${day} ${months[month - 1]} ${year}`;
}
