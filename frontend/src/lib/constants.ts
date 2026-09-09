import { BookOpen, Gift, Lightbulb, Star, Target, Trophy } from "lucide-react";

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL as string;

export const BENEFITS = [
  {
    icon: BookOpen,
    title: "Кругозор и\u00A0эрудиция",
    description: "Шанс продемонстрировать широкий кругозор и эрудицию в области физики"
  },
  {
    icon: Target,
    title: "Оценка знаний",
    description: "Уникальная возможность проявить свои способности и оценить уровень своих знаний"
  },
  {
    icon: Lightbulb,
    title: "Мотивация",
    description: "Мотивация для дальнейшего изучения физики и расширения своих знаний"
  },
  {
    icon: Trophy,
    title: "Опыт",
    description: "Приобретение олимпиадного опыта"
  },
  {
    icon: Star,
    title: "Первый шаг",
    description: "Первый шаг на пути к победам в различных олимпиадах по физике в старших классах"
  },
  {
    icon: Gift,
    title: "Подарки и\u00A0дипломы",
    description: "Победители и призеры ФизФест - олимпиад будут награждены памятными подарками, все участники - дипломами"
  }
];

export const USER_ROLES= [
    "Школьник",
    "Родитель", 
    "Дошкольник",
    "Студент/аспирант и др."
] as const;
