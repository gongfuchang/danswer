"use client";

import {useTranslations} from "next-intl";
import { LoadingAnimation } from "@/components/Loading";
import { AdminPageTitle } from "@/components/admin/Title";
import { KeyIcon, TrashIcon } from "@/components/icons/icons";
import { ApiKeyForm } from "@/components/openai/ApiKeyForm";
import { GEN_AI_API_KEY_URL } from "@/components/openai/constants";
import { fetcher } from "@/lib/fetcher";
import { Text, Title } from "@tremor/react";
import { FiCpu } from "react-icons/fi";
import useSWR, { mutate } from "swr";

const ExistingKeys = () => {
  const t = useTranslations("admin_keys_openai_page");
  const { data, isLoading, error } = useSWR<{ api_key: string }>(
    GEN_AI_API_KEY_URL,
    fetcher
  );

  if (isLoading) {
    return <LoadingAnimation text={t("Loading")} />;
  }

  if (error) {
    return <div className="text-error">{t("Error_loading_existing_keys")}</div>;
  }

  if (!data?.api_key) {
    return null;
  }

  return (
    <div>
      <Title className="mb-2">{t("Existing_Key")}</Title>
      <div className="flex mb-1">
        <p className="text-sm italic my-auto">sk- ****...**{data?.api_key}</p>
        <button
          className="ml-1 my-auto hover:bg-hover rounded p-1"
          onClick={async () => {
            await fetch(GEN_AI_API_KEY_URL, {
              method: "DELETE",
            });
            window.location.reload();
          }}
        >
          <TrashIcon />
        </button>
      </div>
    </div>
  );
};

const Page = () => {
  const t = useTranslations("admin_keys_openai_page");
  return (
    <div className="mx-auto container">
      <AdminPageTitle
        title={t("LLM_Keys")}
        icon={<FiCpu size={32} className="my-auto" />}
      />

      <ExistingKeys />

      <Title className="mb-2 mt-6">{t("Update_Key")}</Title>
      <Text className="mb-2">
        {t("Specify_OpenAI_API_Key")}
      </Text>
      <div className="border rounded-md border-border p-3">
        <ApiKeyForm
          handleResponse={(response) => {
            if (response.ok) {
              mutate(GEN_AI_API_KEY_URL);
            }
          }}
        />
      </div>
    </div>
  );
};

export default Page;
