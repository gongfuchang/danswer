"use client";

import {useTranslations} from "next-intl";
import { usePopup } from "@/components/admin/connectors/Popup";
import { requestEmailVerification } from "../lib";
import { Spinner } from "@/components/Spinner";
import { useState } from "react";

export function RequestNewVerificationEmail({
  children,
  email,
}: {
  children: JSX.Element | string;
  email: string;
}) {
  const t = useTranslations("auth_waitingonverification_RequestNewVerificationEmail");
  const { popup, setPopup } = usePopup();
  const [isRequestingVerification, setIsRequestingVerification] =
    useState(false);

  return (
    <button
      className="text-link"
      onClick={async () => {
        setIsRequestingVerification(true);
        const response = await requestEmailVerification(email);
        setIsRequestingVerification(false);

        if (response.ok) {
          setPopup({
            type: "success",
            message: t("New_Verification_Email_Sent"),
          });
        } else {
          const errorDetail = (await response.json()).detail;
          setPopup({
            type: "error",
            message: `${t("Failed_Send_Verification_Email")} - ${errorDetail}`,
          });
        }
      }}
    >
      {isRequestingVerification && <Spinner />}
      {popup}
      {children}
    </button>
  );
}
