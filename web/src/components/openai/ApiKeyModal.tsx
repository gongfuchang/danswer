"use client";

import {useTranslations} from "next-intl";
import { useState, useEffect } from "react";
import { ApiKeyForm } from "./ApiKeyForm";
import { Modal } from "../Modal";
import { Divider, Text } from "@tremor/react";

export function checkApiKey() {
  if(true) return false; // dummy return value, we don't need to check the API key
}

export const ApiKeyModal = () => {
  const t = useTranslations("components_openai_ApiKeyModal");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);


  if (!errorMsg) {
    return null;
  }

  return (
    <Modal
      title={t("LLM_Key_Setup")}
      className="max-w-4xl"
      onOutsideClick={() => setErrorMsg(null)}
    >
      <div>
        <div>
          <div className="mb-2.5 text-base">
            {t("Provide_Valid_API_Key")}
            <br />
            <br />
            {t("Look_Around_First")}
            <strong
              onClick={() => setErrorMsg(null)}
              className="text-link cursor-pointer"
            >
              {t("Skip_Step")}
            </strong>
            .
          </div>

          <Divider />

          <ApiKeyForm
            handleResponse={(response) => {
              if (response.ok) {
                setErrorMsg(null);
              }
            }}
          />
        </div>
      </div>
    </Modal>
  );
};
