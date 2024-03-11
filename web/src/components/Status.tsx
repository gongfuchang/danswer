"use client";

import {useTranslations} from "next-intl";
import { ValidStatuses } from "@/lib/types";
import { Badge } from "@tremor/react";
import {
  FiAlertTriangle,
  FiCheckCircle,
  FiClock,
  FiPauseCircle,
} from "react-icons/fi";
import { HoverPopup } from "./HoverPopup";

export function IndexAttemptStatus({
  status,
  errorMsg,
  size = "md",
}: {
  status: ValidStatuses;
  errorMsg?: string | null;
  size?: "xs" | "sm" | "md" | "lg";
}) {
  const t = useTranslations("components_Status");
  let badge;

  if (status === "failed") {
    const icon = (
      <Badge size={size} color="red" icon={FiAlertTriangle}>
        {t("Failed")}
      </Badge>
    );
    if (errorMsg) {
      badge = (
        <HoverPopup
          mainContent={<div className="cursor-pointer">{icon}</div>}
          popupContent={
            <div className="flex flex-wrap whitespace-normal w-64">
              {errorMsg}
            </div>
          }
        />
      );
    } else {
      badge = icon;
    }
  } else if (status === "success") {
    badge = (
      <Badge size={size} color="green" icon={FiCheckCircle}>
        {t("Succeeded")}
      </Badge>
    );
  } else if (status === "in_progress") {
    badge = (
      <Badge size={size} color="amber" icon={FiClock}>
        {t("In_Progress")}
      </Badge>
    );
  } else if (status === "not_started") {
    badge = (
      <Badge size={size} color="fuchsia" icon={FiClock}>
        {t("Scheduled")}
      </Badge>
    );
  }

  return <div>{badge}</div>;
}

export function CCPairStatus({
  status,
  disabled,
  isDeleting,
  size = "md",
}: {
  status: ValidStatuses;
  disabled: boolean;
  isDeleting: boolean;
  size?: "xs" | "sm" | "md" | "lg";
}) {
  const t = useTranslations("components_Status");
  let badge;

  if (isDeleting) {
    badge = (
      <Badge size={size} color="red" icon={FiAlertTriangle}>
        {t("Deleting")}
      </Badge>
    );
  } else if (disabled) {
    badge = (
      <Badge size={size} color="yellow" icon={FiPauseCircle}>
        {t("Paused")}
      </Badge>
    );
  } else if (status === "failed") {
    badge = (
      <Badge size={size} color="red" icon={FiAlertTriangle}>
        {t("Error")}
      </Badge>
    );
  } else {
    badge = (
      <Badge size={size} color="green" icon={FiCheckCircle}>
        {t("Active")}
      </Badge>
    );
  }

  return <div>{badge}</div>;
}
