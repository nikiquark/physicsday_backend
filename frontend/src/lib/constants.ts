import { BookOpen, Gift, Lightbulb, Star, Target, Trophy } from "lucide-react";
import { PartnerItem, ProgramItem } from "./types";

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL as string;

export const PROGRAM_ITEMS: ProgramItem[] = [
    {
      title: "Экскурсии в\u00A0научные институты Академгородка",
      image: "/program/institutes.jpg",
      href: "/excursions"
    },
    {
      title:"Уникальные физические демонстрации",
      image: "/dem.jpg"
    },
    {
      title:"Встречи с\u00A0ведущими учеными и\u00A0экспертами в\u00A0различных областях физики",
      image: "/pogosov.jpg"
    },
    {
      title:"ФизКвест",
      image: "/program/quest.jpg"
    },
    {
      title:"Physics Street",
      image: "/program/street.jpg"
    },
    {
      title:"Мастер-классы",
      image: "/program/workshops.jpg",
      href: "/masters"
    },
    {
      title:"ФизФест-олимпиады",
      image: "/olympiads.jpg",
      href: "/olympiads"
    },
    {
      title:"Призы и\u00A0подарки от\u00A0организаторов",
      image: "/program/prizes.jpg"
    },
    {
      title:"",
      image: "/cat1.png"
    }
];

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

export const PARTNERS: PartnerItem[] = [
  {
    name: "ИЯФ СО РАН",
    logo: "/logos/binp.jpg",
    website: "https://www.inp.nsk.su/"
  },
  {
    name: "ИТПМ СО РАН",
    logo: "/logos/itpm.jpg",
    website: "https://itam.nsc.ru/"
  },
  {
    name: "ИТ СО РАН",
    logo: "/logos/it.png",
    website: "http://www.itp.nsc.ru/"
  },
  {
    name: "ИАиЭ СО РАН",
    logo: "/logos/iae.png",
    website: "https://www.iae.nsk.su/ru/"
  },
  {
    name: "ИФП СО РАН",
    logo: "/logos/ifp.png",
    website: "https://www.isp.nsc.ru/"
  },
  {
    name: "ИК СО РАН",
    logo: "/logos/ik.png",
    website: "https://catalysis.ru/"
  },
  {
    name: "ИНХ СО РАН",
    logo: "/logos/inc.png",
    website: "http://niic.nsc.ru/"
  },
  {
    name: "ИХКГ СО РАН",
    logo: "/logos/ihkg.png",
    website: "http://www.kinetics.nsc.ru/index.php/ru/"
  },
  {
    name: "МТЦ СО РАН",
    logo: "/logos/mtc.png",
    website: "https://www.tomo.nsc.ru/"
  },
  {
    name: "СКИФ",
    logo: "/logos/skif.jpg",
    website: "https://srf-skif.ru/index.php/"
  },
  {
    name: "SoftLab NSK",
    logo: "/logos/softlab.png",
    website: "https://www.softlab.tv/"
  },
  {
    name: "PetroGM",
    logo: "/logos/pgm.jpg",
    website: "https://petrogm.com/"
  },
];