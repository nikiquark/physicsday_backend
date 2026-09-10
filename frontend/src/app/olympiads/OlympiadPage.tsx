"use client";

import { motion } from "framer-motion";
import { Calendar, Clock, Trophy, Monitor, LucideIcon } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { FadeInSection } from "@/components/animations/FadeInSection";
import { useModal } from "@/hooks/useModal";
import { Modal } from "@/components/ui/Modal";
import { FlyingCats } from "@/components/animations/FlyingCats";
import { SequentialFadeIn } from "@/components/animations/SequentialFadeIn";
import { BENEFITS } from "@/lib/constants";
import { RegistrationClosed } from "@/components/RegistrationClosed";
import { getRegistration, type SiteContent } from "@/lib/content";

import { 
  apiService, 
  getErrorMessage, 
  type OlympiadParticipantData 
} from "@/services/api";

import { 
  useRegistrationForm, 
  validateStudentForm,
  type StudentFormData 
} from "@/hooks/useRegistrationForm";

const initialFormData: StudentFormData = {
  name: '',
  email: '',
  phone: '',
  city: '',
  school: '',
  class_number: '',
  agreement: false
};

/** «до 10:00 7 октября 2026», новосибирское время. */
function formatDeadline(iso: string): string {
  const parts = new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Novosibirsk",
  }).formatToParts(new Date(iso));
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return `до ${get("hour")}:${get("minute")} ${get("day")} ${get("month")} ${get("year")}`;
}

const BenefitCard = ({ icon: Icon, title, description }: {
  icon: LucideIcon;
  title: string;
  description: string;
}) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 flex items-start space-x-4 h-48"
    >
      <div className="flex-1">
        <div className="flex items-center mb-3">
          <Icon className="w-6 h-6 text-[#344EAD] mr-2" />
          <h3 className="text-xl font-bold text-gray-900 lowercase">{title}</h3>
        </div>
        <p className="text-gray-600 leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
};

export default function OlympiadPage({ content }: { content: SiteContent }) {
  const { settings, socials, olympiad_results: results } = content;
  const registration = getRegistration(content, "olympiads");

  // Итоги показываются только когда они есть и включены в админке.
  const showResults = settings.show_olympiad_results && Boolean(results);

  const [isOpen, modalContent, showModal, closeModal] = useModal();

  // Дедлайн приёма заявок берётся из окна регистрации, чтобы дата
  // в шапке и фактическое закрытие приёма не разъезжались.
  const registrationDeadline = registration.closes_at
    ? formatDeadline(registration.closes_at)
    : "открыта";

  const handleFormSubmit = async (data: StudentFormData) => {
    try {
      // Prepare data for API
      const apiData: OlympiadParticipantData = {
        name: data.name.trim(),
        email: data.email.trim(),
        phone: data.phone.trim(),
        city: data.city.trim(),
        school: data.school.trim(),
        class_number: parseInt(data.class_number, 10)
      };

      // Send data to Django backend
      await apiService.createOlympiadParticipant(apiData);
      
      showModal(
        'success',
        'Регистрация прошла успешно!',
        `Благодарим за регистрацию на олимпиаду 🎉`
      );
      
    } catch (error) {
      console.error('Registration error:', error);
      
      const errorMessage = getErrorMessage(error);
      
      showModal(
        'error',
        'Ошибка регистрации',
        errorMessage
      );
    }
  };

  const {
    formData,
    isSubmitting,
    handleInputChange,
    handleSubmit
  } = useRegistrationForm({
    initialData: initialFormData,
    onSubmit: handleFormSubmit,
    validate: validateStudentForm
  });

  const onSubmitClick = async (e: React.MouseEvent) => {
    // Show loading modal
    showModal('loading', 'Регистрация...', 'Отправляем ваши данные...');
    
    try {
      await handleSubmit(e);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Произошла ошибка валидации';
      
      // Determine modal title based on error type
      let title = 'Ошибка валидации';
      if (errorMessage.includes('согласие')) title = 'Требуется согласие';
      if (errorMessage.includes('поля')) title = 'Заполните все поля';
      if (errorMessage.includes('email')) title = 'Неверный формат email';
      if (errorMessage.includes('класс')) title = 'Неверный класс';
      
      showModal('error', title, errorMessage);
    }
  };

  return (
    <main className="font-sans text-gray-900 scroll-smooth">
      <Header settings={settings} socials={socials} />

      {/* Hero Section */}
      <section className="relative min-h-screen bg-[#344EAD] text-white flex items-center justify-center pt-20">
        <FlyingCats />
        <div className="text-center px-4 max-w-5xl">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-8 leading-tight">
            ФизФест<br />
            олимпиады по физике
          </h1>
          
          {/* Классы */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 max-w-3xl mx-auto">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="text-2xl font-bold">1-4</div>
              <div className="text-sm">классы</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="text-2xl font-bold">5-7</div>
              <div className="text-sm">классы</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="text-2xl font-bold">8-9</div>
              <div className="text-sm">классы</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="text-2xl font-bold">10-11</div>
              <div className="text-sm">классы</div>
            </div>
          </div>

          {/* Важная информация */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-8 space-y-4">
            <div className="grid md:grid-cols-2 gap-4 text-left">
              <div className="flex items-center space-x-3">
                <Clock className="w-6 h-6 text-red-300" />
                <div>
                  <div className="font-semibold">Регистрация</div>
                  <div className="text-gray-200">{registrationDeadline}</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Calendar className="w-6 h-6 text-yellow-300" />
                <div>
                  <div className="font-semibold">Даты проведения</div>
                  <div className="text-gray-200">{settings.olympiad_dates}</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Monitor className="w-6 h-6 text-blue-300" />
                <div>
                  <div className="font-semibold">Формат</div>
                  <div className="text-gray-200">{settings.olympiad_format}</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Trophy className="w-6 h-6 text-green-300" />
                <div>
                  <div className="font-semibold">Подведение итогов</div>
                  <div className="text-gray-200">{settings.olympiad_results_date}</div>
                </div>
              </div>
            </div>
          </div>

          {showResults ? (
            <a
              href="#results"
              className="inline-block bg-white text-[#344EAD] font-semibold px-8 py-4 text-lg rounded-xl shadow-lg hover:bg-gray-100 transition-all duration-300 hover:shadow-xl mb-4"
            >
              Итоги олимпиады
            </a>
          ) : (
            registration.is_open && (
              <a
                href="#register"
                className="inline-block bg-white text-[#344EAD] font-semibold px-8 py-4 text-lg rounded-xl shadow-lg hover:bg-gray-100 transition-all duration-300 hover:shadow-xl mb-4"
              >
                Зарегистрироваться
              </a>
            )
          )}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-8  bg-gray-50">
        <FadeInSection>
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-center text-3xl md:text-4xl font-bold mb-12">
              Участие в олимпиадах — это
            </h2>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {BENEFITS.map((benefit, index) => (
                <SequentialFadeIn key={index} index={index}>
                  <BenefitCard {...benefit} />
                </SequentialFadeIn>
              ))}
            </div>
          </div>
        </FadeInSection>
      </section>

      {/* Registration Section */}
      {!registration.is_open ? (
        <RegistrationClosed state={registration} />
      ) : (
        <section id="register" className="py-16 bg-white px-4">
          <FadeInSection>
            <h2 className="text-center text-3xl font-bold mb-4">
              Регистрация на олимпиаду
            </h2>
            <p className="text-center text-gray-600 mb-12">{registrationDeadline}</p>

            <div className="max-w-xl mx-auto grid gap-6">
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
                type="text"
                placeholder="Телефон или ссылка на профиль ВК/Телеграм"
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
              <input
                name="school"
                className="border border-gray-300 p-3 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-[#344EAD] focus:border-transparent"
                type="text"
                placeholder="Школа"
                value={formData.school}
                onChange={handleInputChange}
                required
              />
              <select
                name="class_number"
                className="border border-gray-300 p-3 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-[#344EAD] focus:border-transparent"
                value={formData.class_number}
                onChange={handleInputChange}
                required
              >
                <option value="" disabled>
                  Выберите класс
                </option>
                {Array.from({ length: 11 }, (_, i) => i + 1).map((num) => (
                  <option key={num} value={num.toString()}>
                    {num}
                  </option>
                ))}
              </select>

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
                {isSubmitting ? "Регистрация..." : "Зарегистрироваться"}
              </button>
            </div>
          </FadeInSection>
        </section>
      )}

      {/* Results Section */}
      {showResults && results && (
        <section id="results" className="py-8 sm:py-16 bg-white px-4">
          <FadeInSection>
            <div className="max-w-5xl mx-auto">
              <h2 className="text-center text-3xl md:text-4xl font-bold mb-4">
                Итоги олимпиады
              </h2>

              <div className="rounded-2xl p-8 mb-8">
                {results.intro && (
                  <p className="text-lg text-gray-700 mb-6">{results.intro}</p>
                )}

                {/* Списки победителей правятся в админке одним полем. */}
                <div
                  className="olympiad-results text-gray-700"
                  dangerouslySetInnerHTML={{ __html: results.body_html }}
                />

                {settings.show_awards_ceremony && settings.awards_ceremony_html && (
                  <div className="border-t-2 border-gray-200 pt-8 mt-8">
                    <div className="relative bg-gradient-to-br from-[#344EAD] to-[#2a3f92] text-white rounded-2xl p-6 md:p-8 overflow-hidden shadow-xl">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
                      <div className="relative z-10">
                        <h3 className="text-xl md:text-2xl font-bold mb-4">
                          Церемония награждения
                        </h3>
                        <div
                          className="space-y-2 text-base md:text-lg"
                          dangerouslySetInnerHTML={{
                            __html: settings.awards_ceremony_html,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </FadeInSection>
        </section>
      )}

      <Footer settings={settings} socials={socials} />

      {/* Modal */}
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