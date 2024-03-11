import {getTranslations} from 'next-intl/server';
import { PersonasTable } from "./PersonaTable";
import { FiPlusSquare } from "react-icons/fi";
import Link from "next/link";
import { Divider, Text, Title } from "@tremor/react";
import { fetchSS } from "@/lib/utilsSS";
import { ErrorCallout } from "@/components/ErrorCallout";
import { Persona } from "./interfaces";
import { RobotIcon } from "@/components/icons/icons";
import { AdminPageTitle } from "@/components/admin/Title";

export default async function Page() {
  const t = await getTranslations("admin_personas_page");
  const personaResponse = await fetchSS("/persona");

  if (!personaResponse.ok) {
    return (
      <ErrorCallout
        errorTitle={t("Error_Title")}
        errorMsg={`Failed to fetch personas - ${await personaResponse.text()}`}
      />
    );
  }

  const personas = (await personaResponse.json()) as Persona[];

  return (
    <div className="mx-auto container">
      <AdminPageTitle icon={<RobotIcon size={26} />} title={t("Personas_Title")} />
      <div>
        <Text className="mb-2">
          {t("Personas_Description")}
        </Text>
        <Text className="mt-2">{t("Customize_Description")}</Text>
        <div className="text-sm">
          <ul className="list-disc mt-2 ml-4">
            <li>
              {t("Prompt_Description")}
            </li>
            <li>{t("Context_Description")}</li>
          </ul>
        </div>

        <div>
          <Divider />

          <Title>{t("Create_Persona")}</Title>
          <Link
            href="/admin/personas/new"
            className="flex py-2 px-4 mt-2 border border-border h-fit cursor-pointer hover:bg-hover text-sm w-36"
          >
            <div className="mx-auto flex">
              <FiPlusSquare className="my-auto mr-2" />
              {t("New_Persona")}
            </div>
          </Link>

          <Divider />

          <Title>{t("Existing_Personas")}</Title>
          <PersonasTable personas={personas} />
        </div>
      </div>

      </div>
      
  );
}
