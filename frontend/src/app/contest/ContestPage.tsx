"use client";

import { useEffect, useState } from "react";
import {
  Award,
  Calendar,
  FileImage,
  FlaskConical,
  GraduationCap,
  Lightbulb,
  MapPin,
  Rocket,
  Upload,
  X,
} from "lucide-react";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { FadeInSection } from "@/components/animations/FadeInSection";
import { FlyingCats } from "@/components/animations/FlyingCats";
import { SequentialFadeIn } from "@/components/animations/SequentialFadeIn";
import { RegistrationClosed } from "@/components/RegistrationClosed";
import { Modal } from "@/components/ui/Modal";
import { useModal } from "@/hooks/useModal";
import {
  useRegistrationForm,
  validateContestForm,
  type ContestFormData,
} from "@/hooks/useRegistrationForm";
import { apiService, getErrorMessage, type ContestWorkData } from "@/services/api";
import { getRegistration, type SiteContent } from "@/lib/content";

/** Условия конкурса. Заявку с другим возрастом форма всё равно примет. */
const MIN_AGE = 5;
const MAX_AGE = 17;

const MAX_FILE_SIZE = 15 * 1024 * 1024;
const ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png", "webp", "heic", "heif"];
/** Форматы, которые браузер нарисует сам: HEIC с айфона он не умеет. */
const PREVIEWABLE_EXTENSIONS = ["jpg", "jpeg", "png", "webp"];

const TOPICS = [
  {
    icon: FlaskConical,
    title: "Научная деятельность",
    description: "Эксперименты, открытия, учёные",
  },
  {
    icon: Lightbulb,
    title: "Популяризация науки",
    description: "Образы, вдохновляющие интерес к знаниям",
  },
  {
    icon: Rocket,
    title: "Законы природы и технологии будущего",
    description: "Гравитация, космос, робототехника",
  },
  {
    icon: GraduationCap,
    title: "Символика ФизФеста и НГУ",
    description: "Логотип, символы, герои, здания кампуса",
  },
];

const initialFormData: ContestFormData = {
  name: "",
  age: "",
  city: "",
  school: "",
  class_number: "",
  title: "",
  parent_name: "",
  email: "",
  phone: "",
  agreement: false,
  publicationConsent: false,
  photo: null,
};

function getExtension(fileName: string): string {
  const parts = fileName.split(".");
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : "";
}

function formatFileSize(bytes: number): string {
  const megabytes = bytes / (1024 * 1024);
  if (megabytes >= 1) return `${megabytes.toFixed(1)} МБ`;
  return `${Math.max(1, Math.round(bytes / 1024))} КБ`;
}

export default function ContestPage({ content }: { content: SiteContent }) {
  const { settings, socials } = content;
  const registration = getRegistration(content, "drawing_contest");

  const [isOpen, modalContent, showModal, closeModal] = useModal();
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);

  // Ссылка на превью держит файл в памяти, пока её не отозвать.
  useEffect(() => {
    return () => {
      if (photoPreview) URL.revokeObjectURL(photoPreview);
    };
  }, [photoPreview]);

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;

    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoPreview(null);
    setPhotoError(null);

    if (!file) {
      setPhoto(null);
      return;
    }

    // Проверяем здесь, а не на сервере: иначе человек ждёт минуту
    // загрузки, чтобы узнать, что формат не подошёл.
    const extension = getExtension(file.name);
    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      setPhoto(null);
      setPhotoError("Такой формат мы не принимаем. Подойдут JPG, PNG, WEBP или HEIC.");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setPhoto(null);
      setPhotoError(
        `Файл весит ${formatFileSize(file.size)} — это больше 15 МБ. ` +
          "Переснимите рисунок в меньшем разрешении или сожмите фото.",
      );
      return;
    }

    setPhoto(file);
    if (PREVIEWABLE_EXTENSIONS.includes(extension)) {
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const clearPhoto = () => {
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhoto(null);
    setPhotoPreview(null);
    setPhotoError(null);
  };

  /**
   * Ход отправки виден в модалке, а не на странице: во время загрузки
   * она закрывает страницу целиком, и полоса под ней была бы не видна.
   */
  const handleUploadProgress = (percent: number) => {
    showModal(
      "loading",
      "Отправляем работу",
      percent < 100
        ? `Загружено ${percent}% — не закрывайте страницу.`
        : "Файл загружен, сохраняем заявку.",
    );
  };

  const handleFormSubmit = async (data: ContestFormData) => {
    try {
      const apiData: ContestWorkData = {
        author_name: data.name.trim(),
        age: parseInt(data.age, 10),
        city: data.city.trim(),
        school: data.school.trim(),
        class_number: data.class_number === "" ? null : parseInt(data.class_number, 10),
        title: data.title.trim(),
        parent_name: data.parent_name.trim(),
        email: data.email.trim(),
        phone: data.phone.trim(),
        publication_consent: data.publicationConsent,
        photo: photo as File,
      };

      const authorName = apiData.author_name;
      const workTitle = apiData.title;

      await apiService.createContestWork(apiData, handleUploadProgress);

      showModal(
        "success",
        "Заявка принята",
        <span>
          {workTitle
            ? `Спасибо! Мы получили работу «${workTitle}» от ${authorName}.`
            : `Спасибо! Мы получили вашу работу.`}
          <br />
          <br />
          Не забудьте принести оригинал рисунка в формате A4{" "}
          <b>27 сентября с 10:00 до 13:00</b> на площадку 2-го этажа главного
          корпуса НГУ (ул. Пирогова, 2).
          <br />
          <br />
          Итоги и работы будут опубликованы на сайте ФизФеста и в сообществе{" "}
          <a
            href="https://vk.ru/ff_fest_nsu"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#344EAD] underline"
          >
            ВКонтакте
          </a>
          .
        </span>,
      );

      clearPhoto();
    } catch (error) {
      console.error("Ошибка отправки работы:", error);
      showModal("error", "Работу не удалось отправить", getErrorMessage(error));
      // Пробрасываем дальше, иначе общий хук сочтёт отправку удачной
      // и очистит форму: после обрыва связи человеку пришлось бы
      // набирать всё заново.
      throw error;
    }
  };

  const { formData, isSubmitting, handleInputChange, handleSubmit } =
    useRegistrationForm({
      initialData: initialFormData,
      onSubmit: handleFormSubmit,
      validate: (data) => validateContestForm({ ...data, photo } as ContestFormData),
    });

  const onSubmitClick = async (event: React.MouseEvent) => {
    showModal("loading", "Отправляем работу", "Загружаем файл, не закрывайте страницу.");

    try {
      await handleSubmit(event);
    } catch (error) {
      // Ошибку от сервера уже показали выше: она приходит объектом
      // ApiError, а проверки формы бросают обычный Error.
      if (!(error instanceof Error)) return;

      const message = error.message;

      let title = "Проверьте форму";
      if (message.includes("согласие")) title = "Требуется согласие";
      if (message.includes("возраст")) title = "Проверьте возраст";
      if (message.includes("рисунк")) title = "Нужен файл с работой";
      if (message.includes("email")) title = "Неверный формат email";

      showModal("error", title, message);
    }
  };

  const parsedAge = parseInt(formData.age, 10);
  const ageOutOfRange =
    formData.age.trim() !== "" &&
    !isNaN(parsedAge) &&
    (parsedAge < MIN_AGE || parsedAge > MAX_AGE);

  const inputClass =
    "border border-gray-300 p-3 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-[#344EAD] focus:border-transparent";

  return (
    <main className="font-sans text-gray-900 scroll-smooth">
      <Header settings={settings} socials={socials} />

      {/* Hero */}
      <section className="relative bg-[#344EAD] text-white pt-28 pb-16 md:pt-32 md:pb-20">
        <FlyingCats />
        <div className="relative z-10 max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center gap-8">
          <div className="text-center md:text-left">
            <p className="text-lg sm:text-xl font-semibold text-blue-100 mb-3">
              Юные художники, ваш выход!
            </p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 leading-tight">
              Конкурс рисунков<br />
              «Приключения котофизиков<br className="hidden sm:inline" /> в мире науки»
            </h1>
            <p className="text-base sm:text-lg text-gray-200 mb-8 leading-relaxed max-w-2xl">
              Нарисуйте котофизиков ФизФеста в мире науки — и приходите за
              подарками на фестиваль 27 сентября 2026 года.
            </p>
            <a
              href="#apply"
              className="inline-block bg-white text-[#344EAD] font-semibold px-8 py-4 text-lg rounded-xl shadow-lg hover:bg-gray-100 transition-all duration-300"
            >
              {registration.is_open ? "Подать работу" : "Условия конкурса"}
            </a>
          </div>
          <img
            src="/cat5.png"
            alt="Котофизик ФизФеста"
            className="w-48 md:w-80 h-auto drop-shadow-xl"
          />
        </div>
      </section>

      {/* Что нужно сделать + темы */}
      <section className="py-14 md:py-20 bg-white px-4">
        <FadeInSection>
          <div className="max-w-3xl mx-auto text-center mb-14">
            <h2 className="text-3xl font-bold mb-6">Что нужно сделать</h2>
            <p className="text-lg text-gray-700 leading-relaxed">
              Нарисовать рисунок на тему науки и её символики, где главными
              героями являются котофизики ФизФеста.
            </p>
          </div>

          <h3 className="text-center text-2xl font-bold mb-12">Это может быть</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {TOPICS.map((topic, index) => {
              const Icon = topic.icon;
              return (
                <SequentialFadeIn key={topic.title} index={index}>
                  <div className="h-full bg-gray-50 rounded-2xl shadow-lg p-6 flex gap-4">
                    <div className="shrink-0 w-12 h-12 rounded-xl bg-[#344EAD] text-white flex items-center justify-center">
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-1">{topic.title}</h3>
                      <p className="text-gray-600">{topic.description}</p>
                    </div>
                  </div>
                </SequentialFadeIn>
              );
            })}
          </div>
        </FadeInSection>
      </section>

      {/* Кто может участвовать + как подать работу */}
      <section className="py-14 md:py-20 bg-gray-50 px-4">
        <FadeInSection>
          <div className="max-w-4xl mx-auto text-center mb-14">
            <h2 className="text-3xl font-bold mb-6">Кто может участвовать</h2>
            <p className="text-lg text-gray-700 leading-relaxed">
              Дети в возрасте от {MIN_AGE} до {MAX_AGE} лет, принимающие участие
              в ФизФесте 27 сентября 2026 года.
            </p>
          </div>

          <h3 className="text-center text-2xl font-bold mb-12">Как подать работу</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-[#344EAD] text-white flex items-center justify-center font-bold">
                  1
                </div>
                <h3 className="text-xl font-semibold">Заполнить заявку</h3>
              </div>
              <p className="text-gray-700 mb-4">
                Заявка заполняется на сайте — к ней нужно приложить фото или скан
                своей работы.
              </p>
              <a
                href="#apply"
                className="inline-block bg-[#344EAD] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#2a3f92] transition"
              >
                {registration.is_open ? "Перейти к заявке" : "Открыть форму"}
              </a>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-[#344EAD] text-white flex items-center justify-center font-bold">
                  2
                </div>
                <h3 className="text-xl font-semibold">Принести оригинал</h3>
              </div>
              <p className="text-gray-700 mb-4">
                Рисунки принимаются в оригинале в формате A4. Перед этим нужно
                заранее подать заявку на сайте.
              </p>
              <p className="flex items-start gap-2 text-gray-700 mb-2">
                <Calendar className="w-5 h-5 mt-0.5 shrink-0 text-[#344EAD]" />
                27 сентября 2026 года, с 10:00 до 13:00
              </p>
              <p className="flex items-start gap-2 text-gray-700">
                <MapPin className="w-5 h-5 mt-0.5 shrink-0 text-[#344EAD]" />
                Площадка 2-го этажа главного корпуса НГУ, ул. Пирогова, 2
              </p>
            </div>
          </div>
        </FadeInSection>
      </section>

      {/* Выставка, публикация и подарки */}
      <section className="py-14 md:py-16 bg-[#344EAD] text-white px-4">
        <FadeInSection>
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-xl font-semibold mb-4">
              Покажите свою любовь к науке и творчеству
            </p>
            <p className="text-blue-100 leading-relaxed">
              Работы будут представлены на выставке в НГУ, а также опубликованы
              на сайте ФизФеста и в сообществе ФизФеста в социальной сети{" "}
              <a
                href="https://vk.ru/ff_fest_nsu"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-white"
              >
                ВКонтакте
              </a>
              .
            </p>

            <div className="mt-10 pt-10 border-t border-white/20">
              <Award className="w-12 h-12 mx-auto mb-4" />
              <p className="text-xl font-semibold">
                Авторов лучших рисунков ждут подарки от организаторов ФизФеста
              </p>
            </div>
          </div>
        </FadeInSection>
      </section>

      {/* Форма */}
      {!registration.is_open ? (
        <div id="apply">
          <RegistrationClosed state={registration} />
        </div>
      ) : (
        <section id="apply" className="py-12 bg-white px-4">
          <FadeInSection>
            <h2 className="text-center text-3xl font-bold mb-12">Заявка на конкурс</h2>

            <div className="max-w-xl mx-auto grid gap-6">
              <input
                name="name"
                className={inputClass}
                type="text"
                placeholder="ФИО автора работы"
                value={formData.name}
                onChange={handleInputChange}
                required
              />

              <div>
                <input
                  name="age"
                  className={inputClass}
                  type="text"
                  inputMode="numeric"
                  placeholder="Возраст автора"
                  value={formData.age}
                  onChange={handleInputChange}
                  required
                />
                {ageOutOfRange && (
                  <p className="mt-2 text-sm text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3">
                    К конкурсу принимаются работы авторов от {MIN_AGE} до {MAX_AGE} лет
                    — заявку мы примем, но к рассмотрению она может не попасть.
                  </p>
                )}
              </div>

              <input
                name="city"
                className={inputClass}
                type="text"
                placeholder="Город"
                value={formData.city}
                onChange={handleInputChange}
                required
              />

              <input
                name="school"
                className={inputClass}
                type="text"
                placeholder="Школа (если есть)"
                value={formData.school}
                onChange={handleInputChange}
              />

              <select
                name="class_number"
                className={inputClass}
                value={formData.class_number}
                onChange={handleInputChange}
              >
                <option value="">Класс (если есть)</option>
                <option value="0">Дошкольник</option>
                {Array.from({ length: 11 }, (_, index) => index + 1).map((grade) => (
                  <option key={grade} value={grade}>
                    {grade} класс
                  </option>
                ))}
              </select>

              <input
                name="title"
                className={inputClass}
                type="text"
                placeholder="Название работы (если есть)"
                value={formData.title}
                onChange={handleInputChange}
              />

              <input
                name="parent_name"
                className={inputClass}
                type="text"
                placeholder="ФИО родителя или законного представителя"
                value={formData.parent_name}
                onChange={handleInputChange}
              />

              <input
                name="email"
                className={inputClass}
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />

              <input
                name="phone"
                className={inputClass}
                type="text"
                placeholder="Телефон для связи"
                value={formData.phone}
                onChange={handleInputChange}
                required
              />

              {/* Файл с работой */}
              <div>
                {!photo ? (
                  <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded-xl p-8 cursor-pointer hover:border-[#344EAD] transition text-center">
                    <Upload className="w-8 h-8 text-[#344EAD]" />
                    <span className="font-semibold">Приложите фото или скан рисунка</span>
                    <span className="text-sm text-gray-500">
                      JPG, PNG, WEBP или HEIC, до 15 МБ
                    </span>
                    <input
                      type="file"
                      className="hidden"
                      accept=".jpg,.jpeg,.png,.webp,.heic,.heif,image/jpeg,image/png,image/webp,image/heic,image/heif"
                      onChange={handlePhotoChange}
                    />
                  </label>
                ) : (
                  <div className="flex items-center gap-4 border border-gray-300 rounded-xl p-4">
                    {photoPreview ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={photoPreview}
                        alt="Выбранная работа"
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-lg bg-gray-100 flex items-center justify-center">
                        <FileImage className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{photo.name}</p>
                      <p className="text-sm text-gray-500">{formatFileSize(photo.size)}</p>
                    </div>
                    <button
                      type="button"
                      onClick={clearPhoto}
                      className="text-gray-400 hover:text-gray-700 transition"
                      aria-label="Убрать файл"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                )}

                {photoError && (
                  <p className="mt-2 text-sm text-red-600">{photoError}</p>
                )}
              </div>

              <label className="flex items-start space-x-3">
                <input
                  name="publicationConsent"
                  type="checkbox"
                  checked={formData.publicationConsent}
                  onChange={handleInputChange}
                  className="w-5 h-5 mt-0.5 text-[#344EAD] rounded focus:ring-[#344EAD]"
                  required
                />
                <span className="text-gray-700">
                  Я согласен на публикацию работы на сайте ФизФеста и в сообществе
                  ВКонтакте
                </span>
              </label>

              <label className="flex items-start space-x-3">
                <input
                  name="agreement"
                  type="checkbox"
                  checked={formData.agreement}
                  onChange={handleInputChange}
                  className="w-5 h-5 mt-0.5 text-[#344EAD] rounded focus:ring-[#344EAD]"
                  required
                />
                <span className="text-gray-700">
                  {settings.privacy_policy_url ? (
                    <>
                      {settings.consent_text}{" "}
                      <a
                        href={settings.privacy_policy_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#344EAD] underline"
                      >
                        (политика обработки данных)
                      </a>
                    </>
                  ) : (
                    settings.consent_text
                  )}
                </span>
              </label>

              <button
                className={`py-3 rounded-xl font-semibold transition w-full ${
                  photo && !isSubmitting
                    ? "bg-[#344EAD] text-white hover:bg-[#2a3f92]"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
                onClick={onSubmitClick}
                disabled={!photo || isSubmitting}
              >
                {isSubmitting ? "Отправляем..." : "Отправить работу"}
              </button>

              {!photo && (
                <p className="text-sm text-gray-600 text-center">
                  Чтобы отправить заявку, приложите фото или скан рисунка
                </p>
              )}
            </div>
          </FadeInSection>
        </section>
      )}

      <Footer settings={settings} socials={socials} />

      <Modal
        isOpen={isOpen}
        onClose={closeModal}
        type={modalContent.type}
        title={modalContent.title}
        message={modalContent.message}
      />
    </main>
  );
}
