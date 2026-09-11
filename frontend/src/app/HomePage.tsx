"use client";

import React, { useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useModal } from "@/hooks/useModal";
import { Modal } from "@/components/ui/Modal";
import { USER_ROLES } from "@/lib/constants";
import { FadeInSection } from "@/components/animations/FadeInSection";
import { FlyingCats } from "@/components/animations/FlyingCats";
import { UserRole } from "@/lib/types";
import { SequentialFadeIn } from "@/components/animations/SequentialFadeIn";
import { RegistrationClosed } from "@/components/RegistrationClosed";
import { MapEmbed } from "@/components/ui/MapEmbed";
import {
  formatEventDate,
  getRegistration,
  type SiteContent,
} from "@/lib/content";
import {
  apiService,
  getErrorMessage,
  type PhysicsDayParticipantData,
} from "@/services/api";

import {
  useRegistrationForm,
  validatePhysicsDayForm,
  type PhysicsDayFormData,
} from "@/hooks/useRegistrationForm";

const initialFormData: PhysicsDayFormData = {
  name: "",
  email: "",
  phone: "",
  city: "",
  school: "",
  class: "",
  agreement: false,
};

export default function HomePage({ content }: { content: SiteContent }) {
  const { settings, program, partners } = content;
  const registration = getRegistration(content, "physicsday");
  const contestRegistration = getRegistration(content, "drawing_contest");

  // На мобильном «Главный корпус НГУ (Пирогова, 2)» не помещается в одну
  // строку — если формат админки «Название (Адрес)», разбиваем на две
  // строки без скобок; на sm+ показываем как есть, одной строкой.
  const eventPlaceMatch = settings.event_place.match(/^(.*?)\s*\(([^)]+)\)\s*$/);

  const [role, setRole] = useState<UserRole>("Школьник");
  const [isOpen, modalContent, showModal, closeModal] = useModal();

  const handleFormSubmit = async (data: PhysicsDayFormData) => {
    try {
      const apiData: PhysicsDayParticipantData = {
        role: role,
        name: data.name.trim(),
        email: data.email.trim(),
        phone: data.phone.trim(),
        city: data.city.trim(),
        ...(role === "Школьник"
          ? { school: data.school.trim(), class_number: parseInt(data.class, 10) }
          : { school: null, class_number: null }),
      };

      await apiService.createPhysicsDayParticipant(apiData);

      showModal(
        "success",
        "Заявка зарегистрирована!",
        <>
          Благодарим за регистрацию 🎉<br />
          <b>
            Регистрация на мастер-классы и олимпиады проходит отдельно через
            соответствующие разделы сайта.
          </b>
          <div className="flex gap-3 mt-4">
            <a
              href="/masters"
              className="flex-1 border-2 border-[#344EAD] text-[#344EAD] px-4 py-2 rounded-lg text-center font-medium hover:bg-[#344EAD] hover:text-white transition-colors"
            >
              Мастер-классы
            </a>
            <a
              href="/olympiads"
              className="flex-1 border-2 border-[#344EAD] text-[#344EAD] px-4 py-2 rounded-lg text-center font-medium hover:bg-[#344EAD] hover:text-white transition-colors"
            >
              Олимпиады
            </a>
          </div>
        </>,
      );

      setRole("Школьник");
    } catch (error) {
      console.error("Registration error:", error);
      showModal("error", "Ошибка регистрации", getErrorMessage(error));
    }
  };

  const validateForm = (data: PhysicsDayFormData): string | null =>
    validatePhysicsDayForm(data, role);

  const { formData, isSubmitting, handleInputChange, handleSubmit } =
    useRegistrationForm({
      initialData: initialFormData,
      onSubmit: handleFormSubmit,
      validate: validateForm,
    });

  const onSubmitClick = async (e: React.MouseEvent) => {
    try {
      await handleSubmit(e);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Произошла ошибка валидации";

      let title = "Ошибка валидации";
      if (errorMessage.includes("согласие")) title = "Требуется согласие";
      if (errorMessage.includes("поля")) title = "Заполните все поля";
      if (errorMessage.includes("email")) title = "Неверный формат email";
      if (errorMessage.includes("класс")) title = "Неверный класс";

      showModal("error", title, errorMessage);
    }
  };

  return (
    <main className="font-sans text-gray-900 scroll-smooth">
      <Header />

      {/* Hero Section */}
      <section
        id="about"
        className="relative h-screen bg-[#344EAD] text-white flex items-center justify-center pt-20"
      >
        <FlyingCats />
        <div className="text-center px-4 max-w-4xl">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            {formatEventDate(settings.event_date)}
            <br />
            ФизФест
            <br />
            {settings.event_time}
          </h1>
          <p className="text-xl sm:text-2xl md:text-4xl mb-4 font-medium">
            {eventPlaceMatch ? (
              <>
                <span className="sm:hidden">
                  {eventPlaceMatch[1]}
                  <br />
                  {eventPlaceMatch[2]}
                </span>
                <span className="hidden sm:inline">{settings.event_place}</span>
              </>
            ) : (
              settings.event_place
            )}
          </p>
          <p className="text-base sm:text-lg md:text-xl text-gray-200 mb-8 leading-relaxed">
            {settings.event_description}
          </p>
          <a
            href="#register"
            className="bg-white text-[#344EAD] font-semibold px-8 py-4 text-lg rounded-xl shadow-lg hover:bg-gray-100 transition-all duration-300 hover:shadow-xl"
          >
            {registration.is_open ? "Зарегистрироваться" : "Программа фестиваля"}
          </a>
        </div>
      </section>

      {/* Program Section */}
      <section id="program" className="py-12 bg-gray-50">
        <FadeInSection>
          <h2 className="text-center text-3xl font-bold mb-12">Программа</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-4 max-w-6xl mx-auto">
            {program.map((item, idx) => {
              const tile = (
                <div className="relative h-64 rounded-xl overflow-hidden shadow-lg group">
                  <img
                    src={item.image}
                    alt={item.title}
                    className={`absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
                      item.title ? "brightness-50" : ""
                    }`}
                  />
                  <div className="relative z-10 p-4 text-white text-lg font-semibold">
                    {item.title}
                  </div>
                </div>
              );

              return (
                <SequentialFadeIn key={item.id} index={idx}>
                  {item.href ? (
                    <a href={item.href} rel="noopener noreferrer">
                      {tile}
                    </a>
                  ) : (
                    tile
                  )}
                </SequentialFadeIn>
              );
            })}
          </div>
        </FadeInSection>
      </section>

      {/* Drawing Contest Section */}
      <section id="contest" className="py-12 bg-white px-4">
        <FadeInSection>
          <div className="max-w-5xl mx-auto bg-[#344EAD] text-white rounded-2xl shadow-lg overflow-hidden flex flex-col md:flex-row items-center gap-6 p-8">
            <img
              src="/cat5.png"
              alt="Котофизик ФизФеста"
              className="w-40 md:w-56 h-auto shrink-0 drop-shadow-xl"
            />
            <div className="text-center md:text-left">
              <h2 className="text-2xl sm:text-3xl font-bold mb-3">
                Конкурс рисунков «Приключения котофизиков в мире науки»
              </h2>
              <p className="text-blue-100 leading-relaxed mb-6">
                Юные художники, ваш выход! Нарисуйте котофизиков ФизФеста в мире
                науки, принесите оригинал на фестиваль — и работа попадёт на
                выставку в НГУ. Авторов лучших рисунков ждут подарки.
              </p>
              <Link
                href="/contest"
                className="inline-block bg-white text-[#344EAD] font-semibold px-6 py-3 rounded-xl shadow hover:bg-gray-100 transition"
              >
                {contestRegistration.is_open ? "Подать работу" : "Приём работ завершён"}
              </Link>
            </div>
          </div>
        </FadeInSection>
      </section>

      {/* Registration Section */}
      {!registration.is_open ? (
        <RegistrationClosed state={registration} />
      ) : (
        <section id="register" className="pt-4 pb-12 bg-white px-4">
          <FadeInSection>
            <h2 className="text-center text-3xl font-bold mb-12">
              Регистрация на ФизФест
            </h2>
            <div className="max-w-xl mx-auto grid gap-6">
              <select
                name="role"
                className="border border-gray-300 p-3 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-[#344EAD] focus:border-transparent"
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                required
              >
                {USER_ROLES.map((item, idx) => (
                  <option key={idx}>{item}</option>
                ))}
              </select>
              <input
                name="name"
                className="border border-gray-300 p-3 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-[#344EAD] focus:border-transparent"
                type="text"
                placeholder="ФИО"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
              <input
                name="email"
                className="border border-gray-300 p-3 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-[#344EAD] focus:border-transparent"
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
              <input
                name="phone"
                className="border border-gray-300 p-3 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-[#344EAD] focus:border-transparent"
                type="tel"
                placeholder="Телефон"
                value={formData.phone}
                onChange={handleInputChange}
                required
              />
              <input
                name="city"
                className="border border-gray-300 p-3 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-[#344EAD] focus:border-transparent"
                type="text"
                placeholder="Город"
                value={formData.city}
                onChange={handleInputChange}
                required
              />
              {role === "Школьник" && (
                <>
                  <input
                    name="school"
                    className="border border-gray-300 p-3 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-[#344EAD] focus:border-transparent"
                    type="text"
                    placeholder="Школа"
                    value={formData.school}
                    onChange={handleInputChange}
                    required
                  />
                  <input
                    name="class"
                    className="border border-gray-300 p-3 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-[#344EAD] focus:border-transparent"
                    type="number"
                    placeholder="Класс (1-11)"
                    min="1"
                    max="11"
                    value={formData.class}
                    onChange={handleInputChange}
                    required
                  />
                </>
              )}
              <label className="flex items-center space-x-3">
                <input
                  name="agreement"
                  type="checkbox"
                  checked={formData.agreement}
                  onChange={handleInputChange}
                  className="w-5 h-5 text-[#344EAD] rounded focus:ring-[#344EAD]"
                  required
                />
                <span className="text-gray-700">{settings.consent_text}</span>
              </label>
              <button
                className={`py-3 rounded-xl font-semibold transition w-full ${
                  !isSubmitting
                    ? "bg-[#344EAD] text-white hover:bg-[#2a3f92]"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
                onClick={onSubmitClick}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Отправка..." : "Отправить"}
              </button>
              <p className="text-sm text-gray-600 text-center">
                Нажимая кнопку «Отправить», вы подтверждаете согласие на
                обработку персональных данных и на получение рассылки от НГУ.
                {settings.privacy_policy_url && (
                  <>
                    {" "}
                    <a
                      href={settings.privacy_policy_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:text-[#344EAD]"
                    >
                      Политика обработки персональных данных
                    </a>
                  </>
                )}
              </p>
            </div>
          </FadeInSection>
        </section>
      )}

      {/* Location Section */}
      <section id="location" className="py-8 bg-gray-50">
        <FadeInSection>
          <h2 className="text-center text-3xl font-bold mb-12">Место проведения</h2>
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16 items-center">
              <div className="h-96 rounded-xl overflow-hidden shadow-lg">
                {/* Виджет Яндекса ставит свои cookie, поэтому грузится
                    только после согласия — см. MapEmbed. */}
                <MapEmbed
                  src="https://yandex.ru/map-widget/v1/?ll=83.093101%2C54.843242&z=18&pt=83.093101,54.843242,pm2rdm"
                  title="НГУ на карте"
                  externalUrl="https://yandex.ru/maps/?pt=83.093101,54.843242&z=16&l=map"
                />
              </div>

              <div className="text-center lg:text-left">
                <h3 className="text-2xl font-bold text-[#344EAD] mb-4">
                  Главный корпус НГУ
                </h3>
                <p className="text-xl text-gray-700 mb-4">
                  ул. Пирогова, 2<br />
                  Новосибирск
                </p>

                <div className="mt-6">
                  <a
                    href="https://yandex.ru/maps/?pt=83.093101,54.843242&z=16&l=map"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-[#344EAD] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#2a3f92] transition-colors"
                  >
                    Открыть в Яндекс.Картах
                  </a>
                </div>
              </div>
            </div>
          </div>
        </FadeInSection>
      </section>

      {/* Partners Section */}
      <section id="partners" className="py-8 bg-white">
        <FadeInSection>
          <h2 className="text-center text-3xl font-bold mb-1">
            Партнёры фестиваля
          </h2>
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
              {partners.map((partner, idx) => (
                <SequentialFadeIn key={partner.id} index={idx}>
                  <a
                    href={partner.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block p-3 rounded-xl transition-all duration-300 hover:shadow-lg"
                  >
                    <div className="aspect-square flex items-center justify-center mb-2">
                      <img
                        src={partner.logo}
                        alt={partner.name}
                        className="max-w-full max-h-full object-contain transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    <p className="text-xs text-gray-700 text-center font-medium group-hover:text-[#344EAD] transition-colors">
                      {partner.name}
                    </p>
                  </a>
                </SequentialFadeIn>
              ))}
            </div>
          </div>
        </FadeInSection>
      </section>

      <Footer settings={settings} socials={content.socials} />

      <Modal
        isOpen={isOpen}
        onClose={closeModal}
        type={modalContent.type}
        title={modalContent.title}
        message={modalContent.message}
      />
    </main>
  );
}
