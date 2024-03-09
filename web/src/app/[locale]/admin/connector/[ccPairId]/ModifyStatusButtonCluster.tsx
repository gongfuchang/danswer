"use client";

import {useTranslations} from "next-intl";
import { Button } from "@tremor/react";
import { CCPairFullInfo } from "./types";
import { usePopup } from "@/components/admin/connectors/Popup";
import { disableConnector } from "@/lib/connector";
import { mutate } from "swr";
import { buildCCPairInfoUrl } from "./lib";

export function ModifyStatusButtonCluster({
  ccPair,
}: {
  ccPair: CCPairFullInfo;
}) {
  const t = useTranslations("admin_connector_ccPairId_ModifyStatusButtonCluster");
  const { popup, setPopup } = usePopup();

  return (
    <>
      {popup}
      {ccPair.connector.disabled ? (
        <Button
          color="green"
          size="xs"
          onClick={() =>
            disableConnector(ccPair.connector, setPopup, () =>
              mutate(buildCCPairInfoUrl(ccPair.id))
            )
          }
          tooltip={t("Click_Start_Indexing_Again")}
        >
          {t("Re-Enable_Button")}
        </Button>
      ) : (
        <Button
          color="red"
          size="xs"
          onClick={() =>
            disableConnector(ccPair.connector, setPopup, () =>
              mutate(buildCCPairInfoUrl(ccPair.id))
            )
          }
          tooltip={
            t("Paused_Connector_Tooltip")
          }
        >
          {t("Pause_Button")}
        </Button>
      )}
    </>

);
}