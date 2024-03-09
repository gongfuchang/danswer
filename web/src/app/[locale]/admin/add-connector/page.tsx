import {useTranslations} from "next-intl";
import { SourceIcon } from "@/components/SourceIcon";
import { AdminPageTitle } from "@/components/admin/Title";
import { ConnectorIcon } from "@/components/icons/icons";
import { SourceCategory, SourceMetadata } from "@/lib/search/interfaces";
import { listSourceMetadata } from "@/lib/sources";
import { Title, Text } from "@tremor/react";
import Link from "next/link";

function SourceTile({ sourceMetadata }: { sourceMetadata: SourceMetadata }) {
  return (
    <Link
      className={`flex 
        flex-col 
        items-center 
        justify-center 
        p-4 
        rounded-lg 
        w-40 
        cursor-pointer
        bg-hover-light
        shadow-md
        hover:bg-hover
      `}
      href={sourceMetadata.adminUrl}
    >
      <SourceIcon sourceType={sourceMetadata.internalName} iconSize={24} />
      <Text className="font-medium text-sm mt-2">
        {sourceMetadata.displayName}
      </Text>
    </Link>
  );
}

export default function Page() {
  const t = useTranslations("admin_addconnector_page");
  const sources = listSourceMetadata();

  const importedKnowledgeSources = sources.filter(
    (source) => source.category === SourceCategory.ImportedKnowledge
  );
  const appConnectionSources = sources.filter(
    (source) => source.category === SourceCategory.AppConnection
  );

  return (
    <div className="mx-auto container">
      <AdminPageTitle
        icon={<ConnectorIcon size={32} />}
        title={t("Add_Connector")}
      />

      <Text>
        {t("Connector_Tips")}
      </Text>

      <div className="flex mt-8">
        <Title>{t("Import_Knowledge_Title")}</Title>
      </div>
      <Text>
        {t("Connect_Knowledge_Outside_Apps")}
      </Text>
      <div className="flex flex-wrap gap-4 p-4">
        {importedKnowledgeSources.map((source) => {
          return (
            <SourceTile key={source.internalName} sourceMetadata={source} />
          );
        })}
      </div>

      <div className="flex mt-8">
        <Title>{t("Setup_Auto_Syncing_Title")}</Title>
      </div>
      <Text>
        {t("Setup_Auto_Syncing_Description")}
      </Text>
      <div className="flex flex-wrap gap-4 p-4">
        {appConnectionSources.map((source) => {
          return (
            <SourceTile key={source.internalName} sourceMetadata={source} />
          );
        })}
      </div>
    </div>
  );
}
