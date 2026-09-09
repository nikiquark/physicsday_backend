/**
 * Каталог мероприятий с сервера.
 *
 * Списки нужны и поисковикам, и посетителю сразу при открытии страницы,
 * поэтому первый запрос идёт на сервере. Счётчик свободных мест
 * обновляется уже в браузере после успешной записи.
 */

import { REVALIDATE_SECONDS } from "./content";
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

export const getWorkshops = () => fetchList<Workshop>("/workshops/");
export const getInstitutes = () => fetchList<Institute>("/excursions/");
