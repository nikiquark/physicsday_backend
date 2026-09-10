/**
 * Каталог мероприятий с сервера.
 *
 * Списки нужны и поисковикам, и посетителю сразу при открытии страницы,
 * поэтому первый запрос идёт на сервере. Счётчик свободных мест
 * обновляется уже в браузере после успешной записи.
 */

import { REVALIDATE_SECONDS } from "./content";
import { toSitePath } from "./media";
import type { Institute, Workshop } from "@/services/api";

const INTERNAL_API =
  process.env.API_URL_INTERNAL ?? "http://backend:8000/api";

async function fetchList<T>(path: string): Promise<T[]> {
  try {
    const response = await fetch(`${INTERNAL_API}${path}`, {
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (!response.ok) {
      console.error(`Бэкенд ответил ${response.status} на ${path}`);
      return [];
    }
    return (await response.json()) as T[];
  } catch (error) {
    console.error(`Бэкенд недоступен (${path}):`, error);
    return [];
  }
}

export async function getWorkshops(): Promise<Workshop[]> {
  const workshops = await fetchList<Workshop>("/workshops/");
  return workshops.map((w) => ({ ...w, image: toSitePath(w.image) }));
}

export async function getInstitutes(): Promise<Institute[]> {
  const institutes = await fetchList<Institute>("/excursions/");
  return institutes.map((i) => ({ ...i, image: toSitePath(i.image) }));
}
