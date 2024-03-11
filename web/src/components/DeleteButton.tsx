import {useTranslations} from "next-intl";
import { FiTrash } from "react-icons/fi";

export function DeleteButton({
  onClick,
  disabled,
}: {
  onClick?: () => void;
  disabled?: boolean;
}) {
  const t = useTranslations("components_DeleteButton");
  return (
    <div
      className={`
        my-auto 
        flex 
        mb-1 
        ${disabled ? "cursor-default" : "hover:bg-hover cursor-pointer"} 
        w-fit 
        p-2 
        rounded-lg
        border-border
        text-sm`}
      onClick={onClick}
    >
      <FiTrash className="mr-1 my-auto" />
      {t("Delete")}
    </div>
  );
}
