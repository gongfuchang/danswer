import { useTranslations } from "next-intl";
import { DeletionAttemptSnapshot, ValidStatuses } from "@/lib/types";
import { usePopup } from "@/components/admin/connectors/Popup";
import { updateConnector } from "@/lib/connector";
import { AttachCredentialButtonForTable } from "@/components/admin/connectors/buttons/AttachCredentialButtonForTable";
import { scheduleDeletionJobForConnector } from "@/lib/documentDeletion";
import { ConnectorsTableProps } from "./ConnectorsTable";
import {
  Table,
  TableHead,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
} from "@tremor/react";
import { DeleteButton } from "@/components/DeleteButton";

const SingleUseConnectorStatus = ({
  indexingStatus,
  deletionAttempt,
}: {
  indexingStatus: ValidStatuses | null;
  deletionAttempt: DeletionAttemptSnapshot | null;
}) => {
  const t= useTranslations(
    "components_admin_connectors_table_SingleUseConnectorsTable"
  );
  if (
    deletionAttempt &&
    (deletionAttempt.status === "PENDING" ||
      deletionAttempt.status === "STARTED")
  ) {
    return <div className="text-error">{t("Deleting_Status")}</div>;
  }

  if (!indexingStatus || indexingStatus === "not_started") {
    return <div>{t("Not_Started_Status")}</div>;
  }

  if (indexingStatus === "in_progress") {
    return <div>{t("In_Progress_Status")}</div>;
  }

  if (indexingStatus === "success") {
    return <div className="text-success">{t("Success_Status")}</div>;
  }

  return <div className="text-error">{t("Failed_Status")}</div>;
};

export function SingleUseConnectorsTable<
  ConnectorConfigType,
  ConnectorCredentialType,
>({
  connectorIndexingStatuses,
  liveCredential,
  getCredential,
  specialColumns,
  onUpdate,
  onCredentialLink,
  includeName = false,
}: ConnectorsTableProps<ConnectorConfigType, ConnectorCredentialType>) {
  const t = useTranslations(
    "components_admin_connectors_table_SingleUseConnectorsTable"
  );
  const { popup, setPopup } = usePopup();

  const connectorIncludesCredential =
    getCredential !== undefined && onCredentialLink !== undefined;

  return (
    <div>
      {popup}

      <Table className="overflow-visible">
        <TableHead>
          <TableRow>
            {includeName && <TableHeaderCell>{t("Name_Column")}</TableHeaderCell>}
            {specialColumns?.map(({ header }) => (
              <TableHeaderCell key={header}>{header}</TableHeaderCell>
            ))}
            <TableHeaderCell>{t("File_Status_Column")}</TableHeaderCell>
            {connectorIncludesCredential && (
              <TableHeaderCell>{t("Credential_Column")}</TableHeaderCell>
            )}
            <TableHeaderCell>{t("Remove_Column")}</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {connectorIndexingStatuses.map((connectorIndexingStatus) => {
            const connector = connectorIndexingStatus.connector;
            // const credential = connectorIndexingStatus.credential;
            const hasValidCredentials =
              liveCredential &&
              connector.credential_ids.includes(liveCredential.id);
            const credentialDisplay = connectorIncludesCredential ? (
              hasValidCredentials ? (
                <div className="max-w-sm truncate">
                  {getCredential(liveCredential)}
                </div>
              ) : liveCredential ? (
                <AttachCredentialButtonForTable
                  onClick={() => onCredentialLink(connector.id)}
                />
              ) : (
                <p className="text-red-700">{t("Not_Available")}</p>
              )
            ) : (
              "-"
            );
            return (
              <TableRow key={connectorIndexingStatus.cc_pair_id}>
                {includeName && (
                  <TableCell className="whitespace-normal break-all">
                    <p className="text font-medium">
                      {connectorIndexingStatus.name}
                    </p>
                  </TableCell>
                )}
                {specialColumns?.map(({ key, getValue }) => (
                  <TableCell key={key}>
                    {getValue(connectorIndexingStatus)}
                  </TableCell>
                ))}
                <TableCell>
                  <SingleUseConnectorStatus
                    indexingStatus={connectorIndexingStatus.last_status}
                    deletionAttempt={connectorIndexingStatus.deletion_attempt}
                  />
                </TableCell>
                {connectorIncludesCredential && (
                  <TableCell>{credentialDisplay}</TableCell>
                )}
                <TableCell>
                  <div
                    className="cursor-pointer mx-auto flex"
                    onClick={async () => {
                      // for one-time, just disable the connector at deletion time
                      // this is required before deletion can happen
                      await updateConnector({
                        ...connector,
                        disabled: !connector.disabled,
                      });

                      const deletionScheduleError =
                        await scheduleDeletionJobForConnector(
                          connector.id,
                          connectorIndexingStatus.credential.id
                        );
                      if (deletionScheduleError) {
                        setPopup({
                          message:
                            t("Failed_Schedule_Deletion_Connector") +
                            deletionScheduleError,
                          type: "error",
                        });
                      } else {
                        setPopup({
                          message: t("Scheduled_Deletion_Connector"),
                          type: "success",
                        });
                      }
                      setTimeout(() => {
                        setPopup(null);
                      }, 4000);
                      onUpdate();
                    }}
                  >
                    <DeleteButton />
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
