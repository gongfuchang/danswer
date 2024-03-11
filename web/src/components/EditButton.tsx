"use client";

import {useTranslations} from "next-intl";
import { FiEdit } from "react-icons/fi";

export function EditButton({ onClick }: { onClick: () => void }) {
  const t = useTranslations("components_EditButton");
  return (
    <div
      className={`
        my-auto 
        flex 
        mb-1 
        hover:bg-hover 
        w-fit 
        p-2 
        cursor-pointer 
        rounded-lg
        border-border
        text-sm`}
      onClick={onClick}
    >
      <FiEdit className="mr-1 my-auto" />
      {t("Edit")}
    </div>
  );
}
