import { useTranslations } from "next-intl";
import { InfoIcon, TrashIcon } from "@/components/icons/icons";
import {
  deleteCCPair,
  scheduleDeletionJobForConnector,
} from "@/lib/documentDeletion";
import { ConnectorIndexingStatus } from "@/lib/types";
import { PopupSpec } from "../Popup";
import { useState } from "react";
import { DeleteButton } from "@/components/DeleteButton";

interface Props<ConnectorConfigType, ConnectorCredentialType> {
  connectorIndexingStatus: ConnectorIndexingStatus<
    ConnectorConfigType,
    ConnectorCredentialType
  >;
  setPopup: (popupSpec: PopupSpec | null) => void;
  onUpdate: () => void;
}

export function DeleteColumn<ConnectorConfigType, ConnectorCredentialType>({
  connectorIndexingStatus,
  setPopup,
  onUpdate,
}: Props<ConnectorConfigType, ConnectorCredentialType>) {
  const t = useTranslations("components_admin_connectors_table_DeleteColumn");
  const [deleteHovered, setDeleteHovered] = useState<boolean>(false);

  const connector = connectorIndexingStatus.connector;
  const credential = connectorIndexingStatus.credential;

  return (
    <div
      className="relative"
      onMouseEnter={() => setDeleteHovered(true)}
      onMouseLeave={() => setDeleteHovered(false)}
    >
      {connectorIndexingStatus.is_deletable ? (
        <div className="cursor-pointer mx-auto flex">
          <DeleteButton
            onClick={() =>
              deleteCCPair(connector.id, credential.id, setPopup, onUpdate)
            }
          />
        </div>
      ) : (
        <div>
          {deleteHovered && (
            <div className="w-64 z-30 whitespace-normal flex absolute mt-8 top-0 left-0 bg-background border border-border px-3 py-2 rounded shadow-lg text-xs">
              <InfoIcon className="flex flex-shrink-0 mr-2" />
              {t("Delete_Connector_Info")}
            </div>
          )}
          <div className="flex mx-auto text-xs">
            <DeleteButton disabled />
          </div>
        </div>
      )}
    </div>
  );
}
