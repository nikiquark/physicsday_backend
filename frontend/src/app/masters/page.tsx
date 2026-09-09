import WorkshopsPage from "./WorkshopPage";

import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Мастер-классы по физике для школьников | ФизФест 2025 | НГУ Новосибирск',
  description: 'Практические мастер-классы по физике на ФизФест 2025. Эксперименты, опыты, научные демонстрации для школьников всех классов. Бесплатная регистрация в НГУ.',
  keywords: 'мастер-классы физика, физические эксперименты, практические занятия физика, НГУ мастер-классы, школьники физика, опыты по физике, ФизФест мастер-классы',
  
  openGraph: {
    title: 'Мастер-классы по физике | ФизФест 2025 НГУ',
    description: 'Практические занятия с экспертами физики. Эксперименты, опыты, научные демонстрации для школьников. Регистрация открыта!',
    url: 'https://physicsday.ru/masters',
    siteName: 'ФизФест НГУ',
    locale: 'ru_RU',
    type: 'website',
  },
  
  alternates: {
    canonical: 'https://physicsday.ru/masters',
  },
}

export default function Workshop() {
    return (
        <WorkshopsPage />
    )
}