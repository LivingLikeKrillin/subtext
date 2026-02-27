import { useTranslation } from "react-i18next";

const UI_LANGUAGES = [
  { code: "en", label: "settings.language.en" },
  { code: "ko", label: "settings.language.ko" },
];

interface LanguageSectionProps {
  currentLanguage: string;
  onChange: (lang: string) => void;
}

export function LanguageSection({ currentLanguage, onChange }: LanguageSectionProps) {
  const { t, i18n } = useTranslation();

  const handleChange = (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem("lang", lang);
    onChange(lang);
  };

  return (
    <div>
      <h3 className="mb-4 text-base font-semibold text-slate-50">
        {t("settings.language.title")}
      </h3>
      <div className="flex flex-col gap-2">
        {UI_LANGUAGES.map(({ code, label }) => (
          <label
            key={code}
            className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors ${
              currentLanguage === code
                ? "border-primary bg-primary/10"
                : "border-border hover:border-slate-500"
            }`}
          >
            <input
              type="radio"
              name="ui-language"
              checked={currentLanguage === code}
              onChange={() => handleChange(code)}
              className="accent-primary"
            />
            <span className="text-sm text-slate-200">{t(label as any)}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
