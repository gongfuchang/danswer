"use client";

import {useTranslations} from "next-intl";
import useSWR from "swr";

import { LoadingAnimation } from "@/components/Loading";
import { NotebookIcon } from "@/components/icons/icons";
import { fetcher } from "@/lib/fetcher";
import { ConnectorIndexingStatus } from "@/lib/types";
import { CCPairIndexingStatusTable } from "./CCPairIndexingStatusTable";
import { AdminPageTitle } from "@/components/admin/Title";
import Link from "next/link";
import { Button, Text } from "@tremor/react";

function Main() {
  const t = useTranslations('admin_indexing_status_page');

  const {
    data: indexAttemptData,
    isLoading: indexAttemptIsLoading,
    error: indexAttemptIsError,
  } = useSWR<ConnectorIndexingStatus<any, any>[]>(
    "/api/manage/admin/connector/indexing-status",
    fetcher,
    { refreshInterval: 10000 } // 10 seconds
  );

  if (indexAttemptIsLoading) {
    return <LoadingAnimation text="" />;
  }

  if (indexAttemptIsError || !indexAttemptData) {
    return <div className="text-red-600">{t("Error_loading_indexing_history")}</div>;
  }

  if (indexAttemptData.length === 0) {
    return (
      <Text>
        {t("No_connector_setup_message")}{" "}
        <Link className="text-blue-500" href="/admin/add-connector">
          {t("Add_Connector")}
        </Link>{" "}
        {t("Get_started_message")}
      </Text>
    );
  }

  // sort by source name
  indexAttemptData.sort((a, b) => {
    if (a.connector.source < b.connector.source) {
      return -1;
    } else if (a.connector.source > b.connector.source) {
      return 1;
    } else {
      return 0;
    }
  });

  return (
    <CCPairIndexingStatusTable ccPairsIndexingStatuses={indexAttemptData} />
  );
}

export default function Status() {
  const t = useTranslations('admin_indexing_status_page');
  return (
    <div className="mx-auto container">
      <AdminPageTitle
        icon={<NotebookIcon size={32} />}
        title={t("Existing_Connectors")}
        farRightElement={
          <Link href="/admin/add-connector">
            <Button color="green" size="xs">
                {t("Add_Connector")}
            </Button>
          </Link>
        }
      />
      <Main />
    </div>
  );
}
