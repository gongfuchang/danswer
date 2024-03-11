"use client";

import {useTranslations} from "next-intl";
import { fetcher } from "@/lib/fetcher";
import useSWR from "swr";

export const HealthCheckBanner = () => {
  const t = useTranslations("components_health_healthcheck");
  const { error } = useSWR("/api/health", fetcher);
  if (!error) {
    return null;
  }

  return (
    <div className="text-xs mx-auto bg-gradient-to-r from-red-900 to-red-700 p-2 rounded-sm border-hidden text-gray-300">
      <p className="font-bold pb-1">{t("Backend_Unavailable")}</p>

      <p className="px-1">
        {t("Backend_Unavailable_Note")}
      </p>
    </div>
  );
};
