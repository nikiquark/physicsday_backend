"use client";

import React, { useState, useEffect } from 'react';

export const CookieBanner = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    // Check if user has already accepted cookies
    const cookiesAccepted = localStorage.getItem('cookiesAccepted');
    if (!cookiesAccepted) {
      // Small delay for better UX
      setTimeout(() => setIsVisible(true), 1000);
    }
  }, []);

  const handleAccept = () => {
    setIsClosing(true);
    setTimeout(() => {
      localStorage.setItem('cookiesAccepted', 'true');
      setIsVisible(false);
    }, 300);
  };

  const handleDecline = () => {
    setIsClosing(true);
    setTimeout(() => {
      localStorage.setItem('cookiesAccepted', 'false');
      setIsVisible(false);
    }, 300);
  };

  if (!isVisible) return null;

  return (
    <div 
      className={`fixed bottom-0 left-0 right-0 z-50 p-4 transition-all duration-300 ${
        isClosing ? 'translate-y-full opacity-0' : 'translate-y-0 opacity-100'
      }`}
    >
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-2xl border-2 border-[#344EAD] overflow-hidden">
        <div className="p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            

            {/* Text Content */}
            <div className="flex-1">
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
                Мы используем cookies
              </h3>
              <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                Этот сайт использует файлы cookie для улучшения пользовательского опыта. <br/>
                Продолжая использовать наш сайт, вы соглашаетесь с использованием файлов cookie.
              </p>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              
              <button
                onClick={handleAccept}
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