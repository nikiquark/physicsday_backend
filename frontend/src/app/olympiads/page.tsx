import OlympiadPage from "./OlympiadPage";

import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Олимпиады по физике для школьников 1-11 классов | ФизФест 2025 | НГУ Новосибирск',
  description: 'Олимпиады по физике на ФизФест 2025 для школьников 1-11 классов. Соревнования, призы, дипломы. Регистрация до 2 октября в НГУ Новосибирск.',
  keywords: 'олимпиада физика, физические олимпиады, НГУ олимпиада, школьная олимпиада физика, соревнования физика, ФизФест олимпиада, олимпиада Новосибирск',
  
  openGraph: {
    title: 'Олимпиады по физике | ФизФест 2025 НГУ',
    description: 'Олимпиады по физике для школьников 1-11 классов. Призы, дипломы, возможность проявить талант. Регистрация до 2 октября!',
    url: 'https://physicsday.ru/olympiads',
    siteName: 'ФизФест НГУ',
    locale: 'ru_RU',
    type: 'website',
  },
  
  alternates: {
    canonical: 'https://physicsday.ru/olympiads',
  },
}

export default function Olympiad() {
    return (
        <OlympiadPage />
    )
}