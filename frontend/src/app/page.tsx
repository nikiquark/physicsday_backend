import HomePage from "./HomePage";
import { getSiteContent } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";

export const revalidate = 60;

export const generateMetadata = () =>
  buildMetadata("home", {
    title: "ФизФест НГУ | День Физики в НГУ | Фестиваль науки для школьников",
    description:
      "ФизФест в НГУ Новосибирск — фестиваль физики для школьников. Мастер-классы, олимпиады, научные эксперименты.",
  });

export default async function Home() {
  const content = await getSiteContent();
  return <HomePage content={content} />;
}
