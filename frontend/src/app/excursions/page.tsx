import ExcursionsPage from "./ExcursionsPage";
import { getInstitutes } from "@/lib/catalog";
import { getSiteContent } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";

export const revalidate = 60;

export const generateMetadata = () =>
  buildMetadata("excursions", {
    title: "Экскурсии в научные институты | ФизФест | НГУ Новосибирск",
    description:
      "Экскурсии в ведущие научные институты на ФизФест. Посетите лаборатории, познакомьтесь с современными исследованиями.",
  });

export default async function Excursions() {
  const [content, institutes] = await Promise.all([getSiteContent(), getInstitutes()]);
  return <ExcursionsPage content={content} initialInstitutes={institutes} />;
}
