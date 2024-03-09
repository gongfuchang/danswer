import {useTranslations} from "next-intl";
import { BasicClickable } from "@/components/BasicClickable";
import { DanswerDocument } from "@/lib/search/interfaces";
import { useState } from "react";
import { FiBook, FiFilter } from "react-icons/fi";

export function SelectedDocuments({
  selectedDocuments,
}: {
  selectedDocuments: DanswerDocument[];
}) {
  const t = useTranslations("chat_modifiers_SelectedDocuments");
  if (selectedDocuments.length === 0) {
    return null;
  }

  return (
    <BasicClickable>
      <div className="flex text-xs max-w-md overflow-hidden">
        <FiBook className="my-auto mr-1" />{" "}
        <div className="w-fit whitespace-nowrap">
          {t("Selected_Documents", {length: selectedDocuments.length})}
        </div>
      </div>
    </BasicClickable>
  );
}
