"use client";

import React, { useCallback, useEffect, useState } from "react";

import {
  CONSENT_OPEN_EVENT,
  applyConsent,
  readConsent,
  saveConsent,
  type ConsentChoice,
} from "@/lib/consent";

interface CookieBannerProps {
  /** Ссылка на политику обработки персональных данных из админки. */
  privacyPolicyUrl?: string;
}

export const CookieBanner = ({ privacyPolicyUrl }: CookieBannerProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    const choice = readConsent();

    // Решение применяется на каждой загрузке, а не только при нажатии:
    // иначе отказ забывался бы, стоило скрипту поставить cookie позже.
    applyConsent(choice);

    if (choice === null) {
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  // Подвал даёт возможность передумать: ссылка «Настройки cookie».
  useEffect(() => {
    const reopen = () => {
      setIsClosing(false);
      setIsVisible(true);
    };
    window.addEventListener(CONSENT_OPEN_EVENT, reopen);
    return () => window.removeEventListener(CONSENT_OPEN_EVENT, reopen);
  }, []);

  const decide = useCallback((choice: ConsentChoice) => {
    saveConsent(choice);
    setIsClosing(true);
    setTimeout(() => setIsVisible(false), 300);
  }, []);

  if (!isVisible) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Использование файлов cookie"
      className={`fixed bottom-0 left-0 right-0 z-50 p-4 transition-all duration-300 ${
        isClosing ? "translate-y-full opacity-0" : "translate-y-0 opacity-100"
      }`}
    >
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-2xl border-2 border-[#344EAD] overflow-hidden">
        <div className="p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="flex-1">
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
                Мы используем cookies
              </h3>
              <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                Часть файлов cookie нужна сайту, чтобы работали формы
                регистрации, — без них отправить заявку не получится.
                Остальные помогают нам понять, как посетители пользуются
                сайтом. От вторых можно отказаться: тогда мы их не поставим,
                а уже сохранённые удалим.
                {privacyPolicyUrl && (
                  <>
                    {" "}
                    <a
                      href={privacyPolicyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#344EAD] underline underline-offset-2 hover:text-[#2a3f92]"
                    >
                      Политика обработки персональных данных
                    </a>
                    .
                  </>
                )}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <button
                onClick={() => decide("declined")}
                className="px-6 py-3 rounded-xl font-semibold border-2 border-[#344EAD] text-[#344EAD] hover:bg-[#344EAD] hover:text-white transition-all duration-300 whitespace-nowrap"
              >
                Отклонить
              </button>
              <button
                onClick={() => decide("accepted")}
                className="px-6 py-3 rounded-xl font-semibold bg-[#344EAD] text-white hover:bg-[#2a3f92] transition-all duration-300 shadow-lg hover:shadow-xl whitespace-nowrap"
              >
                Принять
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
