import { FALLBACK_CONTENT, type SiteSettings, type SocialLink } from "@/lib/content";
import { VkIcon } from "./VkIcon";
import { CookieSettingsLink } from "./ui/CookieSettingsLink";

interface FooterProps {
  // Контакты и соцсети правятся в админке. Значения по умолчанию нужны
  // страницам без данных — например, 404.
  settings?: SiteSettings;
  socials?: SocialLink[];
}

export default function Footer({
  settings = FALLBACK_CONTENT.settings,
  socials = [],
}: FooterProps) {
  return (
    <footer id="contacts" className="bg-[#344EAD] py-10 text-white">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex flex-col md:flex-row items-start justify-between space-y-6 md:space-y-0">
          <div className="text-left order-2 md:order-1">
            <p className="mb-2 hidden md:block">
              Контакты: {settings.contact_email},{" "}
              <span className="whitespace-nowrap">{settings.contact_phone}</span>
            </p>
            <div className="hidden md:block">
              <p className="text-sm">{settings.footer_copyright}</p>
              <p className="text-xs text-white/70 mt-1">
                Made by{" "}
                <a
                  href="https://okhotnikov.space"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors underline-offset-2 underline"
                >
                  Nikita Okhotnikov
                </a>
              </p>
              <p className="text-xs text-white/70 mt-1">
                <CookieSettingsLink />
              </p>
            </div>
          </div>

          {socials.length > 0 && (
            <div className="text-left md:text-right order-1 md:order-2">
              <p className="mb-3">Мы в соцсетях</p>
              <div>
                {socials.map((social) => (
                  <a
                    key={social.id}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-start md:justify-end space-x-2 hover:opacity-75 transition-opacity"
                  >
                    <span className="text-sm">{social.title}</span>
                    <VkIcon className="text-white hover:text-blue-300 transition-colors flex-shrink-0" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Copyright блок для мобильного — внизу страницы */}
        <div className="block md:hidden pt-6 border-t border-white/20 text-left">
          <p className="text-sm">{settings.footer_copyright}</p>
          <p className="text-xs text-white/70 mt-1">
            Made by{" "}
            <a
              href="https://okhotnikov.space"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors underline-offset-2 underline"
            >
              Nikita Okhotnikov
            </a>
          </p>
          <p className="text-xs text-white/70 mt-1">
            <CookieSettingsLink />
          </p>
        </div>
      </div>
    </footer>
  );
}
