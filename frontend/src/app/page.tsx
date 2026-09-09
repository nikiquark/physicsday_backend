"use client";

import React, { useState } from "react";
import { Inter } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useModal } from "@/hooks/useModal";
import { Modal } from "@/components/ui/Modal";
import { PROGRAM_ITEMS, USER_ROLES, PARTNERS } from "@/lib/constants";
import { FadeInSection } from "@/components/animations/FadeInSection";
import { FlyingCats } from "@/components/animations/FlyingCats";
import { UserRole } from "@/lib/types";
import { SequentialFadeIn } from "@/components/animations/SequentialFadeIn";
import { 
  apiService, 
  getErrorMessage, 
  type PhysicsDayParticipantData 
} from "@/services/api";

import { 
  useRegistrationForm, 
  validatePhysicsDayForm,
  type PhysicsDayFormData 
} from "@/hooks/useRegistrationForm";

const inter = Inter({ subsets: ["latin"] });


const initialFormData: PhysicsDayFormData = {
  name: '',
  email: '',
  phone: '',
  city: '',
  school: '',
  class: '',
  agreement: false
};

export default function Home() {
  const [role, setRole] = useState<UserRole>("Школьник");
  const [isOpen, modalContent, showModal, closeModal] = useModal();

  const handleFormSubmit = async (data: PhysicsDayFormData) => {
    try {
      // Prepare data for API
      const apiData: PhysicsDayParticipantData = {
        role: role,
        name: data.name.trim(),
        email: data.email.trim(),
        phone: data.phone.trim(),
        city: data.city.trim(),
        ...(role === "Школьник" ? {
          school: data.school.trim(),
          class_number: parseInt(data.class, 10)
        } : {
          school: null,
          class_number: null
        })
      };

      await apiService.createPhysicsDayParticipant(apiData);

      showModal(
        'success',
        'Заявка зарегистрирована!',
        <>
          Благодарим за регистрацию 🎉<br/>
          <b>Регистрация на мастер-классы и олимпиады проходит отдельно через соответствующие разделы сайта.</b>
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
        </>
      );
      
      // Reset role to default
      setRole("Школьник");

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

  const validateForm = (data: PhysicsDayFormData): string | null => {
    return validatePhysicsDayForm(data, role);
  };

  const {
    formData,
    isSubmitting,
    handleInputChange,
    handleSubmit
  } = useRegistrationForm({
    initialData: initialFormData,
    onSubmit: handleFormSubmit,
    validate: validateForm
  });

  const onSubmitClick = async (e: React.MouseEvent) => {
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
      <section id="about" className="relative h-screen bg-[#344EAD] text-white flex items-center justify-center pt-20">
        <FlyingCats />
        <div className="text-center px-4 max-w-4xl">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            28 сентября 2025<br />
            ФизФест<br />
            11:00
          </h1>
          {/* <p className="text-xl sm:text-2xl md:text-3xl mb-4 font-medium">11:00</p> */}
          <p className="text-xl sm:text-2xl md:text-4xl mb-4 font-medium">Главный корпус НГУ (Пирогова,&nbsp;2)</p>
          <p className="text-base sm:text-lg md:text-xl text-gray-200 mb-8 leading-relaxed">
            Фестиваль науки &quot;ФизФест&quot; — масштабное событие, организуемое студентами и&nbsp;молодыми учеными Новосибирского государственного университета с&nbsp;целью популяризации физики среди школьников и&nbsp;общественности. Участники смогут не&nbsp;только увлекательно провести время, но&nbsp;и&nbsp;пополнить свои знания в&nbsp;области естествознания, приобщиться к&nbsp;фундаментальной науке, познакомиться с&nbsp;учеными&#8209;практиками.
          </p>
          <a href="#register" className="bg-white text-[#344EAD] font-semibold px-8 py-4 text-lg rounded-xl shadow-lg hover:bg-gray-100 transition-all duration-300 hover:shadow-xl">
            Зарегистрироваться
          </a>
        </div>
      </section>

      {/* Program Section */}
      <section id="program" className="py-12 bg-gray-50">
        <FadeInSection>
          <h2 className="text-center text-3xl font-bold mb-12">Программа</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-4 max-w-6xl mx-auto">
            {PROGRAM_ITEMS.map(({title, image, href}, idx) => (
              <SequentialFadeIn key={idx} index={idx}>
                  {href ? (
                    <a href={href} rel="noopener noreferrer">
                      <div key={idx} className="relative h-64 rounded-xl overflow-hidden shadow-lg group">
                        <img
                          src={image}
                          alt={title}
                          className={`absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${title ? 'brightness-50' : ''}`}
                        />
                        <div className="relative z-10 p-4 text-white text-lg font-semibold">
                          {title}
                        </div>
                      </div>
                    </a>
                  ):(
                    <div key={idx} className="relative h-64 rounded-xl overflow-hidden shadow-lg group">
                      <img
                        src={image}
                        alt={title}
                        className={`absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${title ? 'brightness-50' : ''}`}
                      />
                      <div className="relative z-10 p-4 text-white text-lg font-semibold">
                        {title}
                      </div>
                    </div>
                  )}
                  
                
              </SequentialFadeIn>
            ))}
          </div>
        </FadeInSection>
      </section>

      {/* Additional Registration Section */}
      {/* <section className="pt-0 pb-12 bg-gray-50">
        <FadeInSection>
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <a 
                href="/masters" 
                className="group border-2 border-[#344EAD] hover:bg-[#344EAD] transition-all duration-300 rounded-2xl p-8 flex flex-col items-center justify-start min-h-[200px] hover:shadow-lg"
              >
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-[#344EAD] group-hover:text-white mb-4">
                    Регистрация <br/> на мастер-классы
                  </h3>
                  <p className="text-gray-600 group-hover:text-gray-200">
                    Практические занятия с&nbsp;экспертами в&nbsp;области физики
                  </p>
                </div>
              </a>

              <a 
                href="/olympiads" 
                className="group border-2 border-[#344EAD] hover:bg-[#344EAD] transition-all duration-300 rounded-2xl p-8 flex flex-col items-center justify-start min-h-[200px] hover:shadow-lg"
              >
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-[#344EAD] group-hover:text-white mb-4">
                    Регистрация <br/> на олимпиады
                  </h3>
                  <p className="text-gray-600 group-hover:text-gray-200">
                    Участие в&nbsp;мини&#8209;олимпиадах по&nbsp;физике
                  </p>
                </div>
              </a>

              <a 
                href="/excursions" 
                className="group border-2 border-[#344EAD] hover:bg-[#344EAD] transition-all duration-300 rounded-2xl p-8 flex flex-col items-center justify-start min-h-[200px] hover:shadow-lg md:col-span-2 lg:col-span-1"
              >
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-[#344EAD] group-hover:text-white mb-4">
                    Регистрация <br/> на экскурсии
                  </h3>
                  <p className="text-gray-600 group-hover:text-gray-200">
                    Посещение ведущих научных институтов и&nbsp;лабораторий
                  </p>
                </div>
              </a>
            </div>
          </div>
        </FadeInSection>
      </section> */}

      {/* Registration Section */}
      <section id="register" className="py-30 bg-white px-4">
        <FadeInSection>
          <h2 className="text-center text-3xl font-bold mb-12">Регистрация закрыта</h2>
          <div className="max-w-xl mx-auto">
            <p className="text-center text-gray-600 text-lg">
              Регистрация на ФизФест завершена.<br/>Следите за обновлениями на нашем сайте.
            </p>
          </div>
        </FadeInSection>
      </section>
      {/* <section id="register" className="pt-4 pb-12 bg-white px-4">
        <FadeInSection>
          <h2 className="text-center text-3xl font-bold mb-12">Регистрация на ФизФест</h2>
          <div className="max-w-xl mx-auto grid gap-6">
            <select
              name="role"
              className="border border-gray-300 p-3 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-[#344EAD] focus:border-transparent"
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              required
            >
              {USER_ROLES.map((role, idx) => (
                <option key={idx}>{role}</option>
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
              <span className="text-gray-700">Я даю свое согласие на обработку персональных данных</span>
            </label>
            <button 
              className={`py-3 rounded-xl font-semibold transition w-full ${
                !isSubmitting
                  ? 'bg-[#344EAD] text-white hover:bg-[#2a3f92]'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              onClick={onSubmitClick}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Отправка...' : 'Отправить'}
            </button>
            <p className="text-sm text-gray-600 text-center">
              Нажимая кнопку «Отправить», вы подтверждаете согласие на обработку персональных данных и на получение рассылки от НГУ.
            </p>
          </div>
        </FadeInSection>
      </section> */}

      {/* Location Section */}
      <section id="location" className="py-8 bg-gray-50">
        <FadeInSection>
          <h2 className="text-center text-3xl font-bold mb-12">Место проведения</h2>
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16 items-center">
              {/* Map */}
              <div className="h-96 rounded-xl overflow-hidden shadow-lg">
                <iframe
                  src="https://yandex.ru/map-widget/v1/?ll=83.093101%2C54.843242&z=18&pt=83.093101,54.843242,pm2rdm"
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  style={{
                    position: 'relative',
                  }}
                  title="НГУ на карте"
                ></iframe>
              </div>

              {/* Address Info */}
              <div className="text-center lg:text-left">
                <h3 className="text-2xl font-bold text-[#344EAD] mb-4">
                  Главный корпус НГУ
                </h3>
                <p className="text-xl text-gray-700 mb-4">
                  ул. Пирогова, 2<br/>
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
          <h2 className="text-center text-3xl font-bold mb-1">Партнёры фестиваля</h2>
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
              {PARTNERS.map((partner, idx) => (
                <SequentialFadeIn key={idx} index={idx}>
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