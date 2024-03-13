import {useTranslations} from "next-intl";
import { getTranslations } from "next-intl/server";
import { AdminPageTitle } from "@/components/admin/Title";
import { CPUIcon } from "@/components/icons/icons";
import { SlackBotCreationForm } from "../SlackBotConfigCreationForm";
import { fetchSS } from "@/lib/utilsSS";
import { ErrorCallout } from "@/components/ErrorCallout";
import { DocumentSet, SlackBotConfig } from "@/lib/types";
import { Text } from "@tremor/react";
import { BackButton } from "@/components/BackButton";
import { Persona } from "../../personas/interfaces";
import { InstantSSRAutoRefresh } from "@/components/SSRAutoRefresh";

async function Page({ params }: { params: { id: string } }) {
  const t = await getTranslations("admin_bot_id_page");
  const tasks = [
    fetchSS("/manage/admin/slack-bot/config"),
    fetchSS("/manage/document-set"),
    fetchSS("/persona"),
  ];

  const [slackBotsResponse, documentSetsResponse, personasResponse] =
    await Promise.all(tasks);

  if (!slackBotsResponse.ok) {
    return (
      <ErrorCallout
        errorTitle={t("Error_Title")}
        errorMsg={t("Failed_Fetch_Bots", {bots: await slackBotsResponse.text()})}
      />
    );
  }
  const allSlackBotConfigs =
    (await slackBotsResponse.json()) as SlackBotConfig[];
  const slackBotConfig = allSlackBotConfigs.find(
    (config) => config.id.toString() === params.id
  );
  if (!slackBotConfig) {
    return (
      <ErrorCallout
        errorTitle={t("Error_Title")}
        errorMsg={t("Did_Not_Find_ID", {id: params.id})}
      />
    );
  }

  if (!documentSetsResponse.ok) {
    return (
      <ErrorCallout
        errorTitle={t("Error_Title")}
        errorMsg={t("Failed_Fetch_Docs", {sets: await documentSetsResponse.text()})}
      />
    );
}
  const documentSets = (await documentSetsResponse.json()) as DocumentSet[];

  if (!personasResponse.ok) {
    return (
      <ErrorCallout
        errorTitle={t("Error_Title")}
        errorMsg={t("Failed_Fetch_Personas", {personas: await personasResponse.text()})}
      />
    );
  }
  const personas = (await personasResponse.json()) as Persona[];

  return (
    <div className="container mx-auto">
      <InstantSSRAutoRefresh />

      <BackButton />
      <AdminPageTitle
        icon={<CPUIcon size={26} />}
        title={t("Edit_Slack_Bot_Config")}
      />

      <Text className="mb-8">
        {t("Edit_Config_Text")}
      </Text>

      <SlackBotCreationForm
        documentSets={documentSets}
        personas={personas}
        existingSlackBotConfig={slackBotConfig}
      />
    </div>
  );
}

export default Page;
