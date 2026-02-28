import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import type { Profile } from "../../types";
import { useHardware } from "../../hooks/useHardware";
import { HardwareOverview } from "../shared/HardwareOverview";

const PROFILES: Profile[] = ["lite", "balanced", "power"];

interface ProfileSectionProps {
  profile: Profile;
  onChange: (p: Profile) => void;
}

export function ProfileSection({ profile, onChange }: ProfileSectionProps) {
  const { t } = useTranslation();
  const { hardware, recommendation, loading, detect } = useHardware();

  useEffect(() => {
    if (!hardware && !loading) {
      detect();
    }
  }, [hardware, loading, detect]);

  return (
    <div>
      <h3 className="mb-4 text-base font-semibold text-slate-50">
        {t("settings.profile.title")}
      </h3>

      {/* Hardware info */}
      {loading && (
        <div className="mb-6 flex items-center gap-2.5 py-4 text-slate-400">
          <span className="spinner" />
          <span>{t("settings.profile.detecting")}</span>
        </div>
      )}
      {hardware && (
        <div className="mb-6">
          <h4 className="mb-3 text-sm font-medium text-slate-300">
            {t("settings.profile.hardwareTitle")}
          </h4>
          <HardwareOverview hardware={hardware} />
        </div>
      )}

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
            {recommendation?.recommended === p && (
              <span className="ml-auto rounded-full bg-primary/20 px-2 py-0.5 text-xs text-primary">
                {t("settings.profile.recommended")}
              </span>
            )}
          </label>
        ))}
      </div>
    </div>
  );
}
