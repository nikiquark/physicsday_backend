"use client";

import { Inter } from "next/font/google";
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

const inter = Inter({ subsets: ["latin"] });

const initialFormData: StudentFormData = {
  name: '',
  email: '',
  phone: '',
  city: '',
  school: '',
  class_number: '',
  agreement: false
};

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

export default function OlympiadPage() {
  const [isOpen, modalContent, showModal, closeModal] = useModal();

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
      {/* Header */}
      <Header />

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
                  <div className="text-gray-200">до 10:00 2 октября</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Calendar className="w-6 h-6 text-yellow-300" />
                <div>
                  <div className="font-semibold">Даты проведения</div>
                  <div className="text-gray-200">4 — 6 октября 2025</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Monitor className="w-6 h-6 text-blue-300" />
                <div>
                  <div className="font-semibold">Формат</div>
                  <div className="text-gray-200">дистанционный</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Trophy className="w-6 h-6 text-green-300" />
                <div>
                  <div className="font-semibold">Подведение итогов</div>
                  <div className="text-gray-200">не позднее 31 октября 2025</div>
                </div>
              </div>
            </div>
          </div>

          <a 
            href="#results" 
            className="inline-block bg-white text-[#344EAD] font-semibold px-8 py-4 text-lg rounded-xl shadow-lg hover:bg-gray-100 transition-all duration-300 hover:shadow-xl mb-4"
          >
            Итоги олимпиады
          </a>
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

      {/* Results Section */}
      <section id="results" className="py-8 sm:py-16 bg-white px-4">
        <FadeInSection>
          <div className="max-w-5xl mx-auto">
            <h2 className="text-center text-3xl md:text-4xl font-bold mb-4">Итоги олимпиады</h2>
            
            <div className="rounded-2xl p-8 mb-8">
              <p className="text-lg text-gray-700 mb-6">
                Дорогие друзья!<br/>
                Экспертная комиссия завершила проверку работ ФизФест-олимпиады, и мы с радостью сообщаем вам результаты.
              </p>

              {/* 1 место */}
              <div className="mb-8">
                <div className="flex items-center mb-4">
                  <span className="text-3xl mr-3">🥇</span>
                  <h3 className="text-xl md:text-2xl font-bold text-[#344EAD]">1 место ПОБЕДИТЕЛИ</h3>
                </div>
                
                <div className="space-y-4 ml-6 md:ml-12">
                  <div>
                    <h4 className="font-semibold text-base md:text-lg mb-2 text-gray-800">🔹️ 1-4 классы</h4>
                    <ul className="list-disc list-inside text-gray-700 space-y-1">
                      <li>Бердюгин Михаил</li>
                      <li>Горшкова Вероника</li>
                      <li>Корниенко Георгий</li>
                      <li>Минаев Роман</li>
                      <li>Петросян Тарон</li>
                      <li>Пилюгина Виктория</li>
                      <li>Стефанов Тимофей</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-base md:text-lg mb-2 text-gray-800">🔹️ 5-7 классы</h4>
                    <ul className="list-disc list-inside text-gray-700 space-y-1">
                      <li>Ермоленко Михаил</li>
                      <li>Таранец Всеволод</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-base md:text-lg mb-2 text-gray-800">🔹️ 8-9 классы</h4>
                    <ul className="list-disc list-inside text-gray-700 space-y-1">
                      <li>Сарапкин Александр</li>
                      <li>Трясак Семён</li>
                      <li>Шувалов Артём</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* 2 место */}
              <div className="mb-8">
                <div className="flex items-center mb-4">
                  <span className="text-3xl mr-3">🥈</span>
                  <h3 className="text-xl md:text-2xl font-bold text-[#344EAD]">2 место ПРИЗЁРЫ</h3>
                </div>
                
                <div className="space-y-4 ml-6 md:ml-12">
                  <div>
                    <h4 className="font-semibold text-base md:text-lg mb-2 text-gray-800">🔹️ 1-4 классы</h4>
                    <ul className="list-disc list-inside text-gray-700 space-y-1">
                      <li>Волков Виктор</li>
                      <li>Ефременко Тарас</li>
                      <li>Калугина Светлана</li>
                      <li>Пирожков Борис</li>
                      <li>Репнёв Иван</li>
                      <li>Сизов Роман</li>
                      <li>Уфимцев Дмитрий</li>
                      <li>Шевченко Артём</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-base md:text-lg mb-2 text-gray-800">🔹️ 5-7 классы</h4>
                    <ul className="list-disc list-inside text-gray-700 space-y-1">
                      <li>Баранов Фёдор</li>
                      <li>Батуков Иван</li>
                      <li>Васильев Дмитрий</li>
                      <li>Габов Петр</li>
                      <li>Герасимов Максим</li>
                      <li>Зайвий Таисия</li>
                      <li>Захаров Савелий</li>
                      <li>Костылев Кирилл</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-base md:text-lg mb-2 text-gray-800">🔹️ 8-9 классы</h4>
                    <ul className="list-disc list-inside text-gray-700 space-y-1">
                      <li>Антонович Михаил</li>
                      <li>Титов Степан</li>
                      <li>Цветко Евгений</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-base md:text-lg mb-2 text-gray-800">🔹️ 10-11 классы</h4>
                    <ul className="list-disc list-inside text-gray-700 space-y-1">
                      <li>Беляев Егор</li>
                      <li>Куртубашев Артём</li>
                      <li>Матвеев Ярослав</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* 3 место */}
              <div className="mb-8">
                <div className="flex items-center mb-4">
                  <span className="text-3xl mr-3">🥉</span>
                  <h3 className="text-xl md:text-2xl font-bold text-[#344EAD]">3 место ПРИЗЁРЫ</h3>
                </div>
                
                <div className="space-y-4 ml-6 md:ml-12">
                  <div>
                    <h4 className="font-semibold text-base md:text-lg mb-2 text-gray-800">🔹️ 5-7 классы</h4>
                    <ul className="list-disc list-inside text-gray-700 space-y-1">
                      <li>Багинский Андрей</li>
                      <li>Гуревич Максим</li>
                      <li>Иванов Александр</li>
                      <li>Иванов Андрей</li>
                      <li>Калмыкова Вероника</li>
                      <li>Маркус Фёдор</li>
                      <li>Мингулова Екатерина</li>
                      <li>Скворцов Тимофей</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-base md:text-lg mb-2 text-gray-800">🔹️ 8-9 классы</h4>
                    <ul className="list-disc list-inside text-gray-700 space-y-1">
                      <li>Кириллова Диана</li>
                      <li>Никулин Никита</li>
                      <li>Сопотов Михаил</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Заключение */}
              <div className="border-t-2 border-gray-200 pt-8 mt-8">
                <div className="rounded-2xl p-6 md:p-8 mb-6">
                  <div className="flex items-start">
                    <p className="text-base md:text-lg text-gray-800 leading-relaxed">
                      Поздравляем победителей и призеров ФизФест-олимпиады, а также благодарим всех, кто принял участие в решении олимпиадных задач.
                    </p>
                  </div>
                </div>
                
                <div className="relative bg-gradient-to-br from-[#344EAD] to-[#2a3f92] text-white rounded-2xl p-6 md:p-8 overflow-hidden shadow-xl">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
                  
                  <div className="relative z-10">
                    <div className="flex items-start mb-4">
                      <h3 className="text-xl md:text-2xl font-bold">Церемония награждения</h3>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <Calendar className="w-5 h-5 mr-3 flex-shrink-0 text-yellow-300" />
                        <span className="text-base md:text-lg"><strong>14 ноября 2025</strong></span>
                      </div>
                      
                      <div className="flex items-center">
                        <Clock className="w-5 h-5 mr-3 flex-shrink-0 text-yellow-300" />
                        <span className="text-base md:text-lg"><strong>16:00</strong></span>
                      </div>
                      
                      <div className="flex items-start">
                        <Monitor className="w-5 h-5 mr-3 mt-1 flex-shrink-0 text-yellow-300" />
                        <div className="text-base md:text-lg">
                          <strong>Новосибирский государственный университет</strong><br/>
                          <span className="text-gray-200">ул. Пирогова, 2, аудитория 317а</span>
                        </div>
                      </div>
                    </div>
                    
                    <p className="mt-6 text-sm md:text-base text-gray-200">
                      Победители и призёры ФизФест-олимпиады, будем рады видеть вас на церемонии!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </FadeInSection>
      </section>

      {/* Footer */}
      <Footer />

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