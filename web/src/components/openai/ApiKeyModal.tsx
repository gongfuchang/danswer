"use client";

import {useTranslations} from "next-intl";
import { useState, useEffect } from "react";
import { ApiKeyForm } from "./ApiKeyForm";
import { Modal } from "../Modal";
import { Divider, Text } from "@tremor/react";

export async function checkApiKey() {
  const response = await fetch("/api/manage/admin/genai-api-key/validate");
  if (!response.ok && (response.status === 404 || response.status === 400)) {
    const jsonResponse = await response.json();
    return jsonResponse.detail;
  }
  return null;
}

export const ApiKeyModal = () => {
  const t = useTranslations("components_openai_ApiKeyModal");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    checkApiKey().then((error) => {
      console.log(error);
      if (error) {
        setErrorMsg(error);
      }
    });
  }, []);

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
