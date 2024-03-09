"use client";

import {useTranslations} from "next-intl";
import { Button } from "@tremor/react";
import { CCPairFullInfo } from "./types";
import { usePopup } from "@/components/admin/connectors/Popup";
import { FiTrash } from "react-icons/fi";
import { deleteCCPair } from "@/lib/documentDeletion";
import { mutate } from "swr";
import { buildCCPairInfoUrl } from "./lib";

export function DeletionButton({ ccPair }: { ccPair: CCPairFullInfo }) {
  const t = useTranslations("admin_connector_ccPairId_DeletionButton");
  const { popup, setPopup } = usePopup();

  const isDeleting =
    ccPair?.latest_deletion_attempt?.status === "PENDING" ||
    ccPair?.latest_deletion_attempt?.status === "STARTED";

  let tooltip: string;
  if (ccPair.connector.disabled) {
    if (isDeleting) {
      tooltip = t("Deleting_Connector_Message");
    } else {
      tooltip = t("Click_to_Delete");
    }
  } else {
    tooltip = t("Pause_Connector_Before_Delete");
  }

  return (
    <div>
      {popup}
      <Button
        size="xs"
        color="red"
        onClick={() =>
          deleteCCPair(
            ccPair.connector.id,
            ccPair.credential.id,
            setPopup,
            () => mutate(buildCCPairInfoUrl(ccPair.id))
          )
        }
        icon={FiTrash}
        disabled={!ccPair.connector.disabled || isDeleting}
        tooltip={tooltip}
      >
        {t("Schedule_Deletion_Button")}
      </Button>
    </div>
  );
}