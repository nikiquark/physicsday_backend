"use client";

import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, X } from "lucide-react";

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ContactModal({ isOpen, onClose }: ContactModalProps) {
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  // Блокируем скролл фона, добавляем Esc-закрытие и автофокус
  useEffect(() => {
    if (!isOpen) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);

    // Фокус на кнопку закрытия
    requestAnimationFrame(() => closeBtnRef.current?.focus());

    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="contact-modal-title"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            // На мобильных — снизу (bottom sheet), на >=sm — по центру
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 sm:bg-black/80"
            onClick={onClose}
          >
            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 1 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 1 }}
              transition={{ type: "spring", damping: 22, stiffness: 300 }}
              // На мобилках — лист на всю ширину c округлением сверху
              className="w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl mx-0 sm:mx-4 overflow-hidden"
              // Ограничение высоты + прокрутка содержимого
              style={{
                maxHeight: "calc(100dvh - 0.75rem)", // безопасно для мобильных браузеров
                paddingBottom: "env(safe-area-inset-bottom)", // safe area iOS
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-[#344EAD] to-[#4A5BBF] text-white p-4 sm:p-6 relative">
                <button
                  ref={closeBtnRef}
                  onClick={onClose}
                  aria-label="Закрыть окно контактов"
                  className="absolute top-3 right-3 rounded-full p-1 sm:p-3 transition-colors hover:bg-white/10 active:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                >
                  <X className="h-6 w-6 text-white" />
                </button>
                <h2
                  id="contact-modal-title"
                  className="text-lg sm:text-2xl font-bold leading-tight pr-10"
                >
                  Контакты
                </h2>
              </div>

              {/* Content */}
              <div className="p-4 sm:p-6 space-y-4 overflow-y-auto overscroll-contain">
                <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-1 sm:gap-x-2 sm:gap-y-2 text-gray-800">
                  <span className="font-semibold leading-tight">
                    Котельникова Мария Станиславовна
                  </span>

                  {/* Разделители только на широких экранах */}
                  <span className="hidden sm:inline text-gray-300">•</span>

                  <a
                    href="mailto:m.kotelnikova@g.nsu.ru"
                    className="hover:underline break-words"
                  >
                    m.kotelnikova@g.nsu.ru
                  </a>

                  <span className="hidden sm:inline text-gray-300">•</span>

                  <a href="tel:+79139210054" className="hover:underline">
                    +7-913-921-00-54
                  </a>
                </div>

                <motion.a
                  href="https://vk.com/ff_fest_nsu"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0077FF]/40"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  aria-label="Открыть сообщество ФизФест во ВКонтакте"
                >
                  <div className="bg-[#0077FF] text-white p-0 rounded-lg group-hover:bg-[#0066DD] transition-colors">
                    <svg
                      className="h-5 w-5"
                      viewBox="0 0 32 32"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path d="M3 15.48C3 9.59687 3 6.65531 4.82765 4.82765C6.65531 3 9.59687 3 15.48 3H16.52C22.4031 3 25.3447 3 27.1723 4.82765C29 6.65531 29 9.59687 29 15.48V16.52C29 22.4031 29 25.3447 27.1723 27.1723C25.3447 29 22.4031 29 16.52 29H15.48C9.59687 29 6.65531 29 4.82765 27.1723C3 25.3447 3 22.4031 3 16.52V15.48Z" fill="#0077FF"/>
                      <path d="M16.8226 21.8C10.9119 21.8 7.5405 17.746 7.40002 11H10.3608C10.458 15.9514 12.6408 18.0486 14.3697 18.4811V11H17.1576V15.2703C18.8649 15.0865 20.6585 13.1405 21.2636 11H24.0516C23.5869 13.6378 21.6419 15.5838 20.2587 16.3838C21.6419 17.0324 23.8572 18.7297 24.7 21.8H21.6311C20.9719 19.7459 19.3296 18.1567 17.1576 17.9405V21.8H16.8226Z" fill="white"/>
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-base sm:text-sm font-medium text-gray-900">
                      ВКонтакте
                    </p>
                    <p className="text-sm text-gray-600 truncate">
                      ФизФест в ВК
                    </p>
                  </div>
                  <ExternalLink className="h-5 w-5 text-gray-400 group-hover:text-gray-600" />
                </motion.a>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
