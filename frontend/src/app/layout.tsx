import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CookieBanner } from "@/components/ui/CookieBanner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "ФизФест 2025 НГУ | День Физики в НГУ | Фестиваль науки для школьников 28 сентября",
    description: 'ФизФест 2025 в НГУ Новосибирск - фестиваль физики для школьников. Мастер-классы, олимпиады, научные эксперименты. Регистрация открыта!',
    keywords: [
        'ФизФест',
        'НГУ',
        'Новосибирский государственный университет',
        'фестиваль науки',
        'физика',
        'школьники',
        'мастер-классы',
        'олимпиады по физике',
        'эксперименты',
        'популяризация науки',
        'Новосибирск',
        'научный фестиваль',
        'студенты НГУ',
        'физические опыты',
        'образование',
        'наука для школьников',
        'физфак НГУ',
        'молодые ученые',
        'научно-популярные мероприятия',
        'регистрация на фестиваль'
    ],
    authors: [{ name: 'Okhotnikov Nikita', url: 'https://okhotnikov.space' }],
    creator: 'Okhotnikov Nikita',
    publisher: 'Okhotnikov Nikita',
    openGraph: {
        title: 'ФизФест 2025 - Фестиваль науки НГУ',
        description: 'Присоединяйтесь к фестивалю науки ФизФест! Мастер-классы, олимпиады и эксперименты для школьников и всех любителей физики.',
        type: 'website',
        locale: 'ru_RU',
        siteName: 'ФизФест НГУ'
    },
    metadataBase: new URL('https://physicsday.ru'),
    alternates: {
        canonical: '/'
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
    icons: {
        icon: [
            { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
            { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
        ],
        apple: '/apple-touch-icon.png',
        other: [
            {
                rel: 'android-chrome-192x192',
                url: '/android-chrome-192x192.png',
            },
            {
                rel: 'android-chrome-512x512',
                url: '/android-chrome-512x512.png',
            },
        ],
    },
    manifest: '/site.webmanifest',
    other: {
      'geo.region': 'RU-NVS',
      'geo.placename': 'Новосибирск',
      'geo.position': '54.843066;83.093132',
    },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <CookieBanner/>
      </body>
    </html>
  );
}
