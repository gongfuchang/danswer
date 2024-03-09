import {useTranslations} from "next-intl";
import { Modal } from "@/components/Modal";
import { Button, Text } from "@tremor/react";

export function ModelSelectionConfirmaion({
  selectedModel,
  onConfirm,
}: {
  selectedModel: string;
  onConfirm: () => void;
}) {
  const t = useTranslations("admin_models_embedding_ModelSelectionConfirmation");
  return (
    <div className="mb-4">
      <Text className="text-lg mb-4">
        {t.rich("Selected_Model_Text", {b: (chunks) => (<b>{chunks}</b>), model: selectedModel})}
      </Text>
      <Text className="text-lg mb-2">
        {t("Reindex_Background_Message")}
      </Text>
      <Text className="text-lg mb-2">
        {t.rich("Note", {i: (chunks) => (<i>{chunks}</i>)})}
      </Text>
      <div className="flex mt-8">
        <Button className="mx-auto" color="green" onClick={onConfirm}>
          {t("Confirm_Button")}
        </Button>
      </div>
    </div>
  );
}

export function ModelSelectionConfirmaionModal({
  selectedModel,
  onConfirm,
  onCancel,
}: {
  selectedModel: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const t = useTranslations("admin_models_embedding_ModelSelectionConfirmation");
  return (
    <Modal title={t("Update_Model_Title")} onOutsideClick={onCancel}>
      <div>
        <ModelSelectionConfirmaion
          selectedModel={selectedModel}
          onConfirm={onConfirm}
        />
      </div>
    </Modal>
  );
}