import ExcursionPage from "./ExcursionsPage";

import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Экскурсии в научные институты | ФизФест 2025 | НГУ Новосибирск',
  description: 'Экскурсии в ведущие научные институты на ФизФест 2025. Посетите лаборатории, познакомьтесь с современными исследованиями.',
  keywords: 'экскурсии институты, научные экскурсии, лаборатории НГУ, институты Новосибирск, научные исследования, ФизФест экскурсии, академгородок экскурсии',
  
  openGraph: {
    title: 'Экскурсии в научные институты | ФизФест 2025 НГУ',
    description: 'Уникальная возможность посетить ведущие научные институты и лаборатории. Современные исследования, передовые технологии!',
    url: 'https://physicsday.ru/excursions',
    siteName: 'ФизФест НГУ',
    locale: 'ru_RU',
    type: 'website',
  },
  
  alternates: {
    canonical: 'https://physicsday.ru/excursions',
  },
}

export default function Excursion() {
    return (
        <ExcursionPage />
    )
}