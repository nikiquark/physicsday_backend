"use client";

import { openConsentBanner } from "@/lib/consent";

/** Позволяет передумать после того, как баннер закрыт. */
export function CookieSettingsLink({ className = "" }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={openConsentBanner}
      className={`underline underline-offset-2 hover:text-white transition-colors ${className}`}
    >
      Настройки cookie
    </button>
  );
}
