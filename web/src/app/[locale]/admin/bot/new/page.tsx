import { getTranslations } from "next-intl/server";
import { AdminPageTitle } from "@/components/admin/Title";
import { CPUIcon } from "@/components/icons/icons";
import { SlackBotCreationForm } from "../SlackBotConfigCreationForm";
import { fetchSS } from "@/lib/utilsSS";
import { ErrorCallout } from "@/components/ErrorCallout";
import { DocumentSet } from "@/lib/types";
import { BackButton } from "@/components/BackButton";
import { Text } from "@tremor/react";
import { Persona } from "../../personas/interfaces";

async function Page() {
  const t = await getTranslations("admin_bot_new_page");
  const tasks = [fetchSS("/manage/document-set"), fetchSS("/persona")];
  const [documentSetsResponse, personasResponse] = await Promise.all(tasks);

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
      <BackButton />
      <AdminPageTitle
        icon={<CPUIcon size={32} />}
        title={t("New_Slack_Bot_Config")}
      />

      <Text className="mb-8">
        {t("Define_Configuration_Below")}
      </Text>

      <SlackBotCreationForm documentSets={documentSets} personas={personas} />
    </div>
  );
}

export default Page;