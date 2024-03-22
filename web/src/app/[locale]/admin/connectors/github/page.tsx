"use client";

import { useTranslations } from "next-intl";
import * as Yup from "yup";
import { GithubIcon, TrashIcon } from "@/components/icons/icons";
import { TextFormField } from "@/components/admin/connectors/Field";
import { HealthCheckBanner } from "@/components/health/healthcheck";
import useSWR, { useSWRConfig } from "swr";
import { fetcher } from "@/lib/fetcher";
import {
  GithubConfig,
  GithubCredentialJson,
  Credential,
  ConnectorIndexingStatus,
} from "@/lib/types";
import { ConnectorForm } from "@/components/admin/connectors/ConnectorForm";
import { LoadingAnimation } from "@/components/Loading";
import { CredentialForm } from "@/components/admin/connectors/CredentialForm";
import { adminDeleteCredential, linkCredential } from "@/lib/credential";
import { ConnectorsTable } from "@/components/admin/connectors/table/ConnectorsTable";
import { usePublicCredentials } from "@/lib/hooks";
import { Card, Divider, Text, Title } from "@tremor/react";
import { AdminPageTitle } from "@/components/admin/Title";

const Main = () => {
  const t = useTranslations("admin_connectors_github_page");
  const { mutate } = useSWRConfig();
  const {
    data: connectorIndexingStatuses,
    isLoading: isConnectorIndexingStatusesLoading,
    error: isConnectorIndexingStatusesError,
  } = useSWR<ConnectorIndexingStatus<any, any>[]>(
    "/api/manage/admin/connector/indexing-status",
    fetcher
  );

  const {
    data: credentialsData,
    isLoading: isCredentialsLoading,
    error: isCredentialsError,
    refreshCredentials,
  } = usePublicCredentials();

  if (
    (!connectorIndexingStatuses && isConnectorIndexingStatusesLoading) ||
    (!credentialsData && isCredentialsLoading)
  ) {
    return <LoadingAnimation text={t("Loading")} />;
  }

  if (isConnectorIndexingStatusesError || !connectorIndexingStatuses) {
    return <div>Failed to load connectors</div>;
  }

  if (isCredentialsError || !credentialsData) {
    return <div>Failed to load credentials</div>;
  }

  const githubConnectorIndexingStatuses: ConnectorIndexingStatus<
    GithubConfig,
    GithubCredentialJson
  >[] = connectorIndexingStatuses.filter(
    (connectorIndexingStatus) =>
      connectorIndexingStatus.connector.source === "github"
  );
  const githubCredential: Credential<GithubCredentialJson> | undefined =
    credentialsData.find(
      (credential) => credential.credential_json?.github_access_token
    );

  return (
    <>
      <Title className="mb-2 mt-6 ml-auto mr-auto">
        {t("Step1_Provide_Access_Token")}
      </Title>
      {githubCredential ? (
        <>
          {" "}
          <div className="flex mb-1 text-sm">
            <p className="my-auto">Existing Access Token: </p>
            <p className="ml-1 italic my-auto">
              {githubCredential.credential_json.github_access_token}
            </p>{" "}
            <button
              className="ml-1 hover:bg-hover rounded p-1"
              onClick={async () => {
                await adminDeleteCredential(githubCredential.id);
                refreshCredentials();
              }}
            >
              <TrashIcon />
            </button>
          </div>
        </>
      ) : (
        <>
          <Text>
            {t("Note_Read_Docs")}{" "}
            <a
              className="text-blue-500"
              href="https://docs.github.com/en/enterprise-server@3.4/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens"
              target="_blank"
            >
              {t("Note_Read_Docs_Here")}
            </a>{" "}
            {t("Note_Read_Docs_How")}
          </Text>
          <Card className="mt-4">
            <CredentialForm<GithubCredentialJson>
              formBody={
                <>
                  <TextFormField
                    name="github_access_token"
                    label={t("Access_Token_Label")}
                    type="password"
                  />
                </>
              }
              validationSchema={Yup.object().shape({
                github_access_token: Yup.string().required(
                  t("Access_Token_Label_Required")
                ),
              })}
              initialValues={{
                github_access_token: "",
              }}
              onSubmit={(isSuccess) => {
                if (isSuccess) {
                  refreshCredentials();
                }
              }}
            />
          </Card>
        </>
      )}

      <Title className="mb-2 mt-6 ml-auto mr-auto">
        {t("Step2_Choose_Repo")}
      </Title>

      {githubConnectorIndexingStatuses.length > 0 && (
        <>
          <Text className="mb-2">
            {t.rich("Tips_Pull_Duration", {b: (chunks) => (<b>{chunks}</b>)})}
          </Text>
          <div className="mb-2">
            <ConnectorsTable<GithubConfig, GithubCredentialJson>
              connectorIndexingStatuses={githubConnectorIndexingStatuses}
              liveCredential={githubCredential}
              getCredential={(credential) =>
                credential.credential_json.github_access_token
              }
              onCredentialLink={async (connectorId) => {
                if (githubCredential) {
                  await linkCredential(connectorId, githubCredential.id);
                  mutate("/api/manage/admin/connector/indexing-status");
                }
              }}
              specialColumns={[
                {
                  header: t("Repository"),
                  key: "repository",
                  getValue: (ccPairStatus) => {
                    const connectorConfig =
                      ccPairStatus.connector.connector_specific_config;
                    return `${connectorConfig.repo_owner}/${connectorConfig.repo_name}`;
                  },
                },
              ]}
              onUpdate={() =>
                mutate("/api/manage/admin/connector/indexing-status")
              }
            />
          </div>
          <Divider />
        </>
      )}

      {githubCredential ? (
        <Card className="mt-4">
          <h2 className="font-bold mb-3">{t("Connect_New_Repo")}</h2>
          <ConnectorForm<GithubConfig>
            nameBuilder={(values) =>
              `GithubConnector-${values.repo_owner}/${values.repo_name}`
            }
            ccPairNameBuilder={(values) =>
              `${values.repo_owner}/${values.repo_name}`
            }
            source="github"
            inputType="poll"
            formBody={
              <>
                <TextFormField name="repo_owner" label={t("Repository_Owner")} />
                <TextFormField name="repo_name" label={t("Repository_Name")} />
              </>
            }
            validationSchema={Yup.object().shape({
              repo_owner: Yup.string().required(
                t('Tips_Repo_Owner_Required')
              ),
              repo_name: Yup.string().required(
                t('Tips_Repo_Name_Required')
              ),
              include_prs: Yup.boolean().required(),
              include_issues: Yup.boolean().required(),
            })}
            initialValues={{
              repo_owner: "",
              repo_name: "",
              include_prs: true,
              include_issues: true,
            }}
            refreshFreq={10 * 60} // 10 minutes
            credentialId={githubCredential.id}
          />
        </Card>
      ) : (
        <Text>
          {t("Please_Provide_Access_Token")}          
        </Text>
      )}
    </>
  );
};

export default function Page() {
  const t = useTranslations("admin_connectors_github_page");
  return (
    <div className="container mx-auto">
      <div>
        <div className="mb-4">
          <HealthCheckBanner />
        </div>

        <AdminPageTitle
          icon={<GithubIcon size={26} />}
          title={t("Github_Title")}
        />
      </div>

      <div>
        <Main />
      </div>      
    </div>
  );
}
