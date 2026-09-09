import OlympiadPage from "./OlympiadPage";
import { getSiteContent } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";

export const revalidate = 60;

export const generateMetadata = () =>
  buildMetadata("olympiads", {
    title: "Олимпиады по физике для школьников 1-11 классов | ФизФест | НГУ Новосибирск",
    description:
      "Олимпиады по физике на ФизФест для школьников 1-11 классов. Соревнования, призы, дипломы.",
  });

export default async function Olympiad() {
  const content = await getSiteContent();
  return <OlympiadPage content={content} />;
}
