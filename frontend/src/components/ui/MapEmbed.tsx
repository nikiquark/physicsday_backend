"use client";

import { MapPin } from "lucide-react";
import { useEffect, useState } from "react";

import {
  CONSENT_CHANGE_EVENT,
  hasAnalyticsConsent,
  openConsentBanner,
} from "@/lib/consent";

interface MapEmbedProps {
  src: string;
  title: string;
  /** Ссылка «открыть в Яндекс.Картах» — работает и без загрузки виджета. */
  externalUrl: string;
}

/**
 * Карта Яндекса, встроенная только после согласия на cookie.
 *
 * Виджет ставит yandexuid и ещё несколько cookie на домене yandex.ru,
 * причём сразу при загрузке страницы. Удалить их со стороны сайта нельзя —
 * они принадлежат чужому домену. Поэтому единственный честный способ
 * соблюсти отказ — не загружать iframe вовсе.
 *
 * Кто отказался, всё равно видит адрес и ссылку на Яндекс.Карты, а при
 * желании может открыть карту разово кнопкой: это осознанное действие,
 * и сохранённое решение оно не меняет.
 */
export function MapEmbed({ src, title, externalUrl }: MapEmbedProps) {
  // На сервере согласие неизвестно, поэтому сначала всегда заглушка.
  const [allowed, setAllowed] = useState(false);
  const [shownOnce, setShownOnce] = useState(false);

  useEffect(() => {
    const sync = () => setAllowed(hasAnalyticsConsent());
    sync();
    window.addEventListener(CONSENT_CHANGE_EVENT, sync);
    return () => window.removeEventListener(CONSENT_CHANGE_EVENT, sync);
  }, []);

  if (allowed || shownOnce) {
    return (
      <iframe
        src={src}
        width="100%"
        height="100%"
        frameBorder="0"
        style={{ position: "relative" }}
        title={title}
      />
    );
  }

  return (
    <div className="h-full w-full bg-gray-100 border border-gray-200 flex flex-col items-center justify-center text-center p-6 gap-3">
      <MapPin className="w-10 h-10 text-[#344EAD]" aria-hidden="true" />
      <p className="text-gray-700 font-medium">Карта не загружена</p>
      <p className="text-sm text-gray-600 max-w-sm">
        Яндекс.Карты сохраняют свои файлы cookie на устройстве. Мы не
        загружаем карту, пока вы не разрешили их использование.
      </p>
      <div className="flex flex-col sm:flex-row gap-2 mt-1">
        <button
          type="button"
          onClick={() => setShownOnce(true)}
          className="px-5 py-2 rounded-lg font-medium bg-[#344EAD] text-white hover:bg-[#2a3f92] transition-colors"
        >
          Показать карту
        </button>
        <a
          href={externalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="px-5 py-2 rounded-lg font-medium border border-[#344EAD] text-[#344EAD] hover:bg-[#344EAD] hover:text-white transition-colors"
        >
          Открыть в Яндекс.Картах
        </a>
      </div>
      <button
        type="button"
        onClick={openConsentBanner}
        className="text-xs text-gray-500 underline underline-offset-2 hover:text-gray-700"
      >
        Настройки cookie
      </button>
    </div>
  );
}
