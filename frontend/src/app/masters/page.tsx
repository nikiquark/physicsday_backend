import WorkshopPage from "./WorkshopPage";
import { getWorkshops } from "@/lib/catalog";
import { getSiteContent } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";

export const revalidate = 60;

export const generateMetadata = () =>
  buildMetadata("workshops", {
    title: "Мастер-классы по физике для школьников | ФизФест | НГУ Новосибирск",
    description:
      "Практические мастер-классы по физике на ФизФест. Эксперименты, опыты, научные демонстрации для школьников.",
  });

export default async function Masters() {
  const [content, workshops] = await Promise.all([getSiteContent(), getWorkshops()]);
  return <WorkshopPage content={content} initialWorkshops={workshops} />;
}
