"use client";

import {useTranslations} from "next-intl";
import { Button, Text } from "@tremor/react";
import { Modal } from "./Modal";
import Link from "next/link";

export function SwitchModelModal({
  embeddingModelName,
}: {
  embeddingModelName: undefined | null | string;
}) {
  const t = useTranslations("components_SwitchModelModal");
  return (
    <Modal className="max-w-4xl">
      <div className="text-base">
        <h2 className="text-xl font-bold mb-4 pb-2 border-b border-border flex">
          ❗ {t("Switch_Embedding_Model")} ❗
        </h2>
        <Text>
          {t("Old_Embedding_Model_Message")} <i>{embeddingModelName || "thenlper/gte-small"}</i>). {t("Model_Switch_Performance_Message")}
          <br />
          <br />
          {t("Model_Switch_Button_Message")}
        </Text>

        <div className="flex mt-4">
          <Link href="/admin/models/embedding" className="w-fit mx-auto">
            <Button size="xs">{t("Choose_Embedding_Model_Button")}</Button>
          </Link>
        </div>
      </div>
    </Modal>
  );
}
