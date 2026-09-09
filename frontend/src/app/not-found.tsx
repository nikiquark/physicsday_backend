"use client";

import React from "react";
import { Inter } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { FadeInSection } from "@/components/animations/FadeInSection";
import { FlyingCats } from "@/components/animations/FlyingCats";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export default function Custom404() {
  return (
    <main className="font-sans text-gray-900 scroll-smooth min-h-screen flex flex-col">
      {/* Header */}
      <Header />

      {/* 404 Hero Section */}
      <section className="relative flex-1 bg-[#344EAD] text-white flex items-center justify-center pt-20 pb-20">
        <FlyingCats />
        <div className="text-center px-4 max-w-4xl">
          <FadeInSection>
            <div className="mb-8">
              <h1 className="text-8xl sm:text-9xl md:text-[12rem] font-bold mb-4 leading-none opacity-90">
                404
              </h1>
              <div className="w-24 h-1 bg-white mx-auto mb-8"></div>
            </div>
            
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6">
              Страница не найдена
            </h2>
            
            <p className="text-lg sm:text-xl text-gray-200 mb-8 leading-relaxed max-w-2xl mx-auto">
              К сожалению, запрашиваемая страница не существует или была перемещена. 
              Но не расстраивайтесь — у нас есть много интересного!
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/" 
                className="bg-white text-[#344EAD] font-semibold px-8 py-4 text-lg rounded-xl shadow-lg hover:bg-gray-100 transition-all duration-300 hover:shadow-xl"
              >
                На главную
              </Link>
              
              <a 
                href="/masters" 
                className="border-2 border-white text-white font-semibold px-8 py-4 text-lg rounded-xl hover:bg-white hover:text-[#344EAD] transition-all duration-300"
              >
                Мастер-классы
              </a>
              
              <a 
                href="/olympiads" 
                className="border-2 border-white text-white font-semibold px-8 py-4 text-lg rounded-xl hover:bg-white hover:text-[#344EAD] transition-all duration-300"
              >
                Олимпиады
              </a>
            </div>
          </FadeInSection>
        </div>
      </section>

      {/* Helpful Links Section */}
      <section className="py-16 bg-gray-50">
        <FadeInSection>
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h3 className="text-2xl font-bold mb-8 text-gray-800">
              Возможно, вас заинтересует:
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Link 
                href="/#about" 
                className="group p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border-2 border-transparent hover:border-[#344EAD]"
              >
                <div className="w-12 h-12 bg-[#344EAD] rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4 className="text-lg font-semibold text-gray-800 mb-2">О ФизФесте</h4>
                <p className="text-gray-600 text-sm">Узнайте больше о фестивале науки</p>
              </Link>
              
              <Link 
                href="/#program" 
                className="group p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border-2 border-transparent hover:border-[#344EAD]"
              >
                <div className="w-12 h-12 bg-[#344EAD] rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h4 className="text-lg font-semibold text-gray-800 mb-2">Программа</h4>
                <p className="text-gray-600 text-sm">Посмотрите программу мероприятий</p>
              </Link>
              
              <Link 
                href="/#register" 
                className="group p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border-2 border-transparent hover:border-[#344EAD]"
              >
                <div className="w-12 h-12 bg-[#344EAD] rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <h4 className="text-lg font-semibold text-gray-800 mb-2">Регистрация</h4>
                <p className="text-gray-600 text-sm">Зарегистрируйтесь на ФизФест</p>
              </Link>
            </div>
          </div>
        </FadeInSection>
      </section>

      {/* Footer */}
      <Footer />
    </main>
  );
}