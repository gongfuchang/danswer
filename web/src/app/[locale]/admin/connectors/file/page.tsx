"use client";

import {useTranslations} from "next-intl";
import useSWR, { useSWRConfig } from "swr";
import * as Yup from "yup";

import { FileIcon } from "@/components/icons/icons";
import { fetcher } from "@/lib/fetcher";
import { HealthCheckBanner } from "@/components/health/healthcheck";
import { ConnectorIndexingStatus, FileConfig } from "@/lib/types";
import { createCredential, linkCredential } from "@/lib/credential";
import { useState } from "react";
import { usePopup } from "@/components/admin/connectors/Popup";
import { createConnector, runConnector } from "@/lib/connector";
import { Spinner } from "@/components/Spinner";
import { SingleUseConnectorsTable } from "@/components/admin/connectors/table/SingleUseConnectorsTable";
import { LoadingAnimation } from "@/components/Loading";
import { Form, Formik } from "formik";
import { TextFormField } from "@/components/admin/connectors/Field";
import { FileUpload } from "@/components/admin/connectors/FileUpload";
import { getNameFromPath } from "@/lib/fileUtils";
import { Button, Card, Divider, Text } from "@tremor/react";
import { AdminPageTitle } from "@/components/admin/Title";

const Main = () => {
  const t = useTranslations("admin_connectors_file_page");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [filesAreUploading, setFilesAreUploading] = useState<boolean>(false);
  const { popup, setPopup } = usePopup();

  const { mutate } = useSWRConfig();

  const {
    data: connectorIndexingStatuses,
    isLoading: isConnectorIndexingStatusesLoading,
  } = useSWR<ConnectorIndexingStatus<any, any>[]>(
    "/api/manage/admin/connector/indexing-status",
    fetcher
  );

  if (!connectorIndexingStatuses && isConnectorIndexingStatusesLoading) {
    return <LoadingAnimation text={t("Loading")} />;
  }

  const fileIndexingStatuses: ConnectorIndexingStatus<FileConfig, {}>[] =
    connectorIndexingStatuses?.filter(
      (connectorIndexingStatus) =>
        connectorIndexingStatus.connector.source === "file"
    ) ?? [];

  return (
    <div>
      {popup}
      {filesAreUploading && <Spinner />}
      <Text className="mb-2">
        {t.rich("Specify_Files", {i: (chunks) => (<i>{chunks}</i>), b: (chunks) => (<b>{chunks}</b>)})}
      </Text>
      <Text className="mb-3">
        {t.rich("Note_P1", {b: (chunks) => (<b>{chunks}</b>)})}
        <div className="flex my-2">
          <div className="mx-auto font-bold">
            #QM_METADATA={"{"}&quot;link&quot;: &quot;{"<LINK>"}&quot;{"}"}
          </div>
        </div>{" "}
        {t.rich("Note_P2", {i: (chunks) => (<i>{chunks}</i>), b: (chunks) => (<b>{chunks}</b>)})}
        <a
          href="https://docs.danswer.dev/connectors/file"
          className="text-link"
        >
          {t("Note_P3")}
        </a>
      </Text>
      <div className="flex mt-4">
        <div className="mx-auto w-full">
          <Card>
            <Formik
              initialValues={{
                name: "",
                selectedFiles: [],
              }}
              validationSchema={Yup.object().shape({
                name: Yup.string().required(
                  t("Descriptive_Name_Required")
                ),
              })}
              onSubmit={async (values, formikHelpers) => {
                const uploadCreateAndTriggerConnector = async () => {
                  const formData = new FormData();

                  selectedFiles.forEach((file) => {
                    formData.append("files", file);
                  });

                  const response = await fetch(
                    "/api/manage/admin/connector/file/upload",
                    { method: "POST", body: formData }
                  );
                  const responseJson = await response.json();
                  if (!response.ok) {
                    setPopup({
                      message: t("Unable_Upload_Files", {detail: responseJson.detail}),
                      type: "error",
                    });
                    return;
                  }

                  const filePaths = responseJson.file_paths as string[];
                  const [connectorErrorMsg, connector] =
                    await createConnector<FileConfig>({
                      name: "FileConnector-" + Date.now(),
                      source: "file",
                      input_type: "load_state",
                      connector_specific_config: {
                        file_locations: filePaths,
                      },
                      refresh_freq: null,
                      disabled: false,
                    });
                  if (connectorErrorMsg || !connector) {
                    setPopup({
                      message: t("Unable_Create_Connector", {errorMsg: connectorErrorMsg}),
                      type: "error",
                    });
                    return;
                  }

                  // Since there is no "real" credential associated with a file connector
                  // we create a dummy one here so that we can associate the CC Pair with a
                  // user. This is needed since the user for a CC Pair is found via the credential
                  // associated with it.
                  const createCredentialResponse = await createCredential({
                    credential_json: {},
                    admin_public: true,
                  });
                  if (!createCredentialResponse.ok) {
                    const errorMsg = await createCredentialResponse.text();
                    setPopup({
                      message: t("Error_Creating_Credential", {errorMsg: connectorErrorMsg}),
                      type: "error",
                    });
                    formikHelpers.setSubmitting(false);
                    return;
                  }
                  const credentialId = (await createCredentialResponse.json())
                    .id;

                  const credentialResponse = await linkCredential(
                    connector.id,
                    credentialId,
                    values.name
                  );
                  if (!credentialResponse.ok) {
                    const credentialResponseJson =
                      await credentialResponse.json();
                    setPopup({
                      message: t("Unable_Link_Connector_Credential", {detail: credentialResponseJson.detail}),
                      type: "error",
                    });
                    return;
                  }

                  const runConnectorErrorMsg = await runConnector(
                    connector.id,
                    [0]
                  );
                  if (runConnectorErrorMsg) {
                    setPopup({
                      message: t("Unable_Run_Connector", {errorMsg: runConnectorErrorMsg}),
                      type: "error",
                    });
                    return;
                  }

                  mutate("/api/manage/admin/connector/indexing-status");
                  setSelectedFiles([]);
                  formikHelpers.resetForm();
                  setPopup({
                    type: "success",
                    message: t("Successfully_Uploaded_Files"),
                  });
                };

                setFilesAreUploading(true);
                try {
                  await uploadCreateAndTriggerConnector();
                } catch (e) {
                  console.log(`{t("Failed_Index_Files")}: `, e);
                }
                setFilesAreUploading(false);
              }}
            >
              {({ values, isSubmitting }) => (
                <Form>
                  <h2 className="font-bold text-emphasis text-xl mb-2">
                    {t("Upload_Files")}
                  </h2>
                  <TextFormField
                    name="name"
                    label={t("Name_Label")}
                    placeholder={t("Name_Placeholder")}
                    autoCompleteDisabled={true}
                  />

                  <p className="mb-1 font-medium text-emphasis">{t("Files_Label")}</p>
                  <FileUpload
                    selectedFiles={selectedFiles}
                    setSelectedFiles={setSelectedFiles}
                  />
                  <div className="flex">
                    <Button
                      className="mt-4 w-64 mx-auto"
                      color="green"
                      size="xs"
                      type="submit"
                      disabled={
                        selectedFiles.length === 0 ||
                        !values.name ||
                        isSubmitting
                      }
                    >
                      {t("Upload_Button")}
                    </Button>
                  </div>
                </Form>
              )}
            </Formik>
          </Card>

        </div>
      </div>

      {fileIndexingStatuses.length > 0 && (
        <div>
          <Divider />
          <h2 className="font-bold text-xl mb-2">{t("Indexed_Files_Title")}</h2>
          <SingleUseConnectorsTable<FileConfig, {}>
            connectorIndexingStatuses={fileIndexingStatuses}
            specialColumns={[
              {
                header: t("File_Names_Header"),
                key: "file_names",
                getValue: (ccPairStatus) =>
                  ccPairStatus.connector.connector_specific_config.file_locations
                    .map(getNameFromPath)
                    .join(", "),
              },
            ]}
            onUpdate={() =>
              mutate("/api/manage/admin/connector/indexing-status")
            }
          />
        </div>
      )}
    </div>
  );
};

export default function File() {
  const t = useTranslations("admin_connectors_file_page");
  return (
    <div className="mx-auto container">
      <div>
        <div className="mb-4">
          <HealthCheckBanner />
        </div>

        <AdminPageTitle icon={<FileIcon size={26} />} title={t("File")} />
      </div>
      <div>
        <Main />
      </div>      
    </div>
  );
}
