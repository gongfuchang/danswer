"use client";

import {useTranslations} from "next-intl";
import { useRouter } from "next/navigation";

import { FiChevronLeft } from "react-icons/fi";

export function BackButton({
  behaviorOverride,
}: {
  behaviorOverride?: () => void;
}) {
  const t = useTranslations("components_BackButton");
  const router = useRouter();

  return (
    <div
      className={`
        my-auto 
        flex 
        mb-1
        mt-4 
        hover:bg-hover-light 
        w-fit 
        p-1
        pr-2 
        cursor-pointer 
        rounded-lg 
        text-sm`}
      onClick={() => {
        if (behaviorOverride) {
          behaviorOverride();
        } else {
          router.back();
        }
      }}
    >
      <FiChevronLeft className="mr-1 my-auto" />
        {t("Back")}
    </div>
  );
}
