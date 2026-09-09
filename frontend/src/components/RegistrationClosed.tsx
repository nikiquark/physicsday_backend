import { FadeInSection } from "@/components/animations/FadeInSection";
import type { RegistrationState } from "@/lib/content";

/**
 * Заглушка вместо формы, когда регистрация ещё не открылась или уже
 * закрыта. Заголовок и текст задаются в админке, раздел
 * «Регистрация: разделы».
 */
export function RegistrationClosed({ state }: { state: RegistrationState }) {
  return (
    <section id="register" className="py-30 bg-white px-4">
      <FadeInSection>
        <h2 className="text-center text-3xl font-bold mb-12">{state.closed_title}</h2>
        <div className="max-w-xl mx-auto">
          <p className="text-center text-gray-600 text-lg whitespace-pre-line">
            {state.message}
          </p>
        </div>
      </FadeInSection>
    </section>
  );
}
