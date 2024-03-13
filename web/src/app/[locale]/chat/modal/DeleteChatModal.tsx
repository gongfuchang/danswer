import {useTranslations} from "next-intl";
import { FiTrash, FiX } from "react-icons/fi";
import { ModalWrapper } from "./ModalWrapper";
import { BasicClickable } from "@/components/BasicClickable";

export const DeleteChatModal = ({
  chatSessionName,
  onClose,
  onSubmit,
}: {
  chatSessionName: string;
  onClose: () => void;
  onSubmit: () => void;
}) => {
  const t = useTranslations("chat_modal_DeleteChatModal");
  return (
    <ModalWrapper onClose={onClose}>
      <>
        <div className="flex mb-4">
          <h2 className="my-auto text-2xl font-bold">{t("Delete_Chat_Title")}</h2>
          <div
            onClick={onClose}
            className="my-auto ml-auto p-2 hover:bg-hover rounded cursor-pointer"
          >
            <FiX size={20} />
          </div>
        </div>
        <p className="mb-4">
          {t.rich("Confirm_Delete_Chat", {b: (chunks) => (<b>{chunks}</b>), detail: chatSessionName.slice(0, 30)})}
        </p>
        <div className="flex">
          <div className="mx-auto">
            <BasicClickable onClick={onSubmit}>
              <div className="flex mx-2">
                <FiTrash className="my-auto mr-2" />
                {t("Delete")}
              </div>
            </BasicClickable>
          </div>
        </div>
      </>
    </ModalWrapper>
  );
};
