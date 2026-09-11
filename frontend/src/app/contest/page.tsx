import ContestPage from "./ContestPage";
import { getSiteContent } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";

export const revalidate = 60;

export const generateMetadata = () =>
  buildMetadata("contest", {
    title: "Конкурс рисунков «Приключения котофизиков в мире науки» | ФизФест НГУ",
    description:
      "Конкурс детских рисунков о науке на ФизФесте в НГУ. Участники 5–17 лет, приём работ до 27 сентября. Подайте заявку и приложите фото рисунка.",
  });

export default async function Contest() {
  const content = await getSiteContent();
  return <ContestPage content={content} />;
}
