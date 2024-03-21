"use client";

import {useTranslations} from "next-intl";
import useSWR, { useSWRConfig } from "swr";
import * as Yup from "yup";

import { LoadingAnimation } from "@/components/Loading";
import {
  GlobeIcon,
  GearIcon,
  ArrowSquareOutIcon,
} from "@/components/icons/icons";
import { fetcher } from "@/lib/fetcher";
import {
  SelectorFormField,
  TextFormField,
} from "@/components/admin/connectors/Field";
import { HealthCheckBanner } from "@/components/health/healthcheck";
import { ConnectorIndexingStatus, WebConfig } from "@/lib/types";
import { ConnectorsTable } from "@/components/admin/connectors/table/ConnectorsTable";
import { ConnectorForm } from "@/components/admin/connectors/ConnectorForm";
import { AdminPageTitle } from "@/components/admin/Title";
import { Card, Title } from "@tremor/react";

const SCRAPE_TYPE_TO_PRETTY_NAME = {
  recursive: "Recursive",
  single: "Single_Page",
  sitemap: "Sitemap",
};

export default function Web() {
  const t = useTranslations("admin_connectors_web_page");
  const { mutate } = useSWRConfig();

  const {
    data: connectorIndexingStatuses,
    isLoading: isConnectorIndexingStatusesLoading,
    error: isConnectorIndexingStatusesError,
  } = useSWR<ConnectorIndexingStatus<any, any>[]>(
    "/api/manage/admin/connector/indexing-status",
    fetcher
  );

  const webIndexingStatuses: ConnectorIndexingStatus<WebConfig, {}>[] =
    connectorIndexingStatuses?.filter(
      (connectorIndexingStatus) =>
        connectorIndexingStatus.connector.source === "web"
    ) ?? [];

  return (
    <div className="mx-auto container">
      <div>
        <div className="mb-4">
          <HealthCheckBanner />
        </div>

        <AdminPageTitle icon={<GlobeIcon size={26} />} title={t("Web_Title")} />
      </div>

      <div>
        <Title className="mb-2 mt-6 ml-auto mr-auto">
          {t("Step_1_Specify_Websites")}
        </Title>
        <p className="text-sm mb-2">
          {t("Fetch_Website_State_Daily")}
        </p>
        <Card>
          <ConnectorForm<WebConfig>
            nameBuilder={(values) => `WebConnector-${values.base_url}`}
            ccPairNameBuilder={(values) => values.base_url}
            // Since there is no "real" credential associated with a web connector
            // we create a dummy one here so that we can associate the CC Pair with a
            // user. This is needed since the user for a CC Pair is found via the credential
            // associated with it.
            shouldCreateEmptyCredentialForConnector={true}
            source="web"
            inputType="load_state"
            formBody={
              <>
                <TextFormField
                  name="base_url"
                  label={t("URL_Index")}
                  autoCompleteDisabled={false}
                />
                <div className="w-full">
                  <SelectorFormField
                    name="web_connector_type"
                    label={t("Scrape_Method")}
                    options={[
                      {
                        name: t("Recursive"),
                        value: "recursive",
                        description: t("Recursive_Description"),
                      },
                      {
                        name: t("Single_Page"),
                        value: "single",
                        description: t("Single_Page_Description"),
                      },
                      {
                        name: t("Sitemap"),
                        value: "sitemap",
                        description: t("Sitemap_Description")
                      },
                    ]}
                  />
                </div>
              </>
            }
            validationSchema={Yup.object().shape({
              base_url: Yup.string().required(
                t("Please_Enter_Website_URL")
              ),
              web_connector_type: Yup.string()
                .oneOf(["recursive", "single", "sitemap"])
                .optional(),
            })}
            initialValues={{
              base_url: "",
              web_connector_type: undefined,
            }}
            refreshFreq={60 * 60 * 24} // 1 day
          />
        </Card>

        <Title className="mb-2 mt-6 ml-auto mr-auto">
          {t("Already_Indexed_Websites")}
        </Title>
        {isConnectorIndexingStatusesLoading ? (
          <LoadingAnimation text={t("Loading")} />
        ) : isConnectorIndexingStatusesError || !connectorIndexingStatuses ? (
          <div>{t("Error_Indexing_history")}</div>
        ) : webIndexingStatuses.length > 0 ? (
          <ConnectorsTable<WebConfig, {}>
            connectorIndexingStatuses={webIndexingStatuses}
            specialColumns={[
              {
                header: t("Base_URL"),
                key: "base_url",
                getValue: (
                  ccPairStatus: ConnectorIndexingStatus<WebConfig, any>
                ) => {
                  const connectorConfig =
                    ccPairStatus.connector.connector_specific_config;
                  return (
                    <div className="flex w-fit">
                      <a
                        className="text-blue-500 ml-1 my-auto flex"
                        href={connectorConfig.base_url}
                      >
                        {connectorConfig.base_url}
                        <ArrowSquareOutIcon className="my-auto flex flex-shrink-0 text-blue-500" />
                      </a>
                      <a
                        className="my-auto"
                        href={`/admin/connector/${ccPairStatus.cc_pair_id}`}
                      >
                        <GearIcon className="ml-2 my-auto flex flex-shrink-0 text-gray-400" />
                      </a>
                    </div>
                  );
                },
              },
              {
                header: t("Scrape_Method"),
                key: "web_connector_type",
                getValue: (ccPairStatus) => {
                  const connectorConfig =
                    ccPairStatus.connector.connector_specific_config;
                  return connectorConfig.web_connector_type
                    ? t(SCRAPE_TYPE_TO_PRETTY_NAME[
                        connectorConfig.web_connector_type
                      ])
                    : t("Recursive");
                },
              },
            ]}
            onUpdate={() => mutate("/api/manage/admin/connector/indexing-status")}
          />
        ) : (
          <p className="text-sm">{t("No_Indexed_Websites_Found")}</p>
        )}        
      </div>
      
    </div>
  );
}
