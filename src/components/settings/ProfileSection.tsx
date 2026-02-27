import { useTranslation } from "react-i18next";
import type { Profile } from "../../types";

const PROFILES: Profile[] = ["lite", "balanced", "power"];

interface ProfileSectionProps {
  profile: Profile;
  onChange: (p: Profile) => void;
}

export function ProfileSection({ profile, onChange }: ProfileSectionProps) {
  const { t } = useTranslation();

  return (
    <div>
      <h3 className="mb-4 text-base font-semibold text-slate-50">
        {t("settings.profile.title")}
      </h3>
      <p className="mb-4 text-sm text-slate-400">
        {t("settings.profile.description")}
      </p>
      <div className="flex flex-col gap-2">
        {PROFILES.map((p) => (
          <label
            key={p}
            className={`flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-colors ${
              profile === p
                ? "border-primary bg-primary/10"
                : "border-border hover:border-slate-500"
            }`}
          >
            <input
              type="radio"
              name="settings-profile"
              checked={profile === p}
              onChange={() => onChange(p)}
              className="accent-primary"
            />
            <div>
              <span className="text-sm font-medium text-slate-200">
                {t(`settings.profile.${p}`)}
              </span>
              <p className="text-xs text-slate-500">
                {t(`settings.profile.${p}Desc`)}
              </p>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}
