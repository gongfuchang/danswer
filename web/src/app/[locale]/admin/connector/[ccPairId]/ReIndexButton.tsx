"use client";

import {useTranslations} from "next-intl";
import { PopupSpec, usePopup } from "@/components/admin/connectors/Popup";
import { runConnector } from "@/lib/connector";
import { Button, Divider, Text } from "@tremor/react";
import { useRouter } from "next/navigation";
import { mutate } from "swr";
import { buildCCPairInfoUrl } from "./lib";
import { useState } from "react";
import { Modal } from "@/components/Modal";

function ReIndexPopup({
  connectorId,
  credentialId,
  ccPairId,
  setPopup,
  hide,
}: {
  connectorId: number;
  credentialId: number;
  ccPairId: number;
  setPopup: (popupSpec: PopupSpec | null) => void;
  hide: () => void;
}) {
  const t = useTranslations("admin_connector_ccPairId_ReIndexButton");
  async function triggerIndexing(fromBeginning: boolean) {
    const errorMsg = await runConnector(
      connectorId,
      [credentialId],
      fromBeginning
    );
    if (errorMsg) {
      setPopup({
        message: errorMsg,
        type: "error",
      });
    } else {
      setPopup({
        message: t("Connector_Run_Success"),
        type: "success",
      });
    }
    mutate(buildCCPairInfoUrl(ccPairId));
  }

  return (
    <Modal title={t("Running_Indexing")} onOutsideClick={hide}>
      <div>
        <Button
          className="ml-auto"
          color="green"
          size="xs"
          onClick={() => {
            triggerIndexing(false);
            hide();
          }}
        >
          {t("Button_Run_Update")}
        </Button>

        <Text className="mt-2">
          {t("Update_Tips")}
        </Text>

        <Divider />

        <Button
          className="ml-auto"
          color="green"
          size="xs"
          onClick={() => {
            triggerIndexing(true);
            hide();
          }}
        >
          {t("Button_Run_Complete_Reindexing")}
        </Button>

        <Text className="mt-2">
          {t("Reindex_All_Documents")}
        </Text>

        <Text className="mt-2">
          {t.rich("Note", {b: (chunks) => (<b>{chunks}</b>)})}
        </Text>
      </div>
    </Modal>
  );
}

export function ReIndexButton({
  ccPairId,
  connectorId,
  credentialId,
  isDisabled,
}: {
  ccPairId: number;
  connectorId: number;
  credentialId: number;
  isDisabled: boolean;
}) {
  const t = useTranslations("admin_connector_ccPairId_ReIndexButton");
  const { popup, setPopup } = usePopup();
  const [reIndexPopupVisible, setReIndexPopupVisible] = useState(false);

  return (
    <>
      {reIndexPopupVisible && (
        <ReIndexPopup
          connectorId={connectorId}
          credentialId={credentialId}
          ccPairId={ccPairId}
          setPopup={setPopup}
          hide={() => setReIndexPopupVisible(false)}
        />
      )}
      {popup}
      <Button
        className="ml-auto"
        color="green"
        size="xs"
        onClick={() => {
          setReIndexPopupVisible(true);
        }}
        disabled={isDisabled}
        tooltip={
          isDisabled
            ? t("Connector_Musts_Indexing")
            : undefined
        }
      >
        {t("Run_Indexing")}
      </Button>
    </>
  );
}
