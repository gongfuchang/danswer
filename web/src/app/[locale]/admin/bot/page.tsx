"use client";

import {useTranslations} from "next-intl";
import { ThreeDotsLoader } from "@/components/Loading";
import { PageSelector } from "@/components/PageSelector";
import {
  CPUIcon,
  EditIcon,
  SlackIcon,
  TrashIcon,
} from "@/components/icons/icons";
import { SlackBotConfig } from "@/lib/types";
import { useState } from "react";
import { useSlackBotConfigs, useSlackBotTokens } from "./hooks";
import { PopupSpec, usePopup } from "@/components/admin/connectors/Popup";
import { deleteSlackBotConfig, isPersonaASlackBotPersona } from "./lib";
import { SlackBotTokensForm } from "./SlackBotTokensForm";
import { AdminPageTitle } from "@/components/admin/Title";
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  Text,
  Title,
} from "@tremor/react";
import {
  FiArrowUpRight,
  FiChevronDown,
  FiChevronUp,
  FiSlack,
} from "react-icons/fi";
import Link from "next/link";
import { InstantSSRAutoRefresh } from "@/components/SSRAutoRefresh";

const numToDisplay = 50;

const SlackBotConfigsTable = ({
  slackBotConfigs,
  refresh,
  setPopup,
}: {
  slackBotConfigs: SlackBotConfig[];
  refresh: () => void;
  setPopup: (popupSpec: PopupSpec | null) => void;
}) => {
  const t = useTranslations("admin_bot_page");
  const [page, setPage] = useState(1);

  // sort by name for consistent ordering
  slackBotConfigs.sort((a, b) => {
    if (a.id < b.id) {
      return -1;
    } else if (a.id > b.id) {
      return 1;
    } else {
      return 0;
    }
  });

  return (
    <div>
      <Table>
        <TableHead>
          <TableRow>
          <TableHeaderCell>{t("Channels_Title")}</TableHeaderCell>
          <TableHeaderCell>{t("Persona_Title")}</TableHeaderCell>
          <TableHeaderCell>{t("Document_Sets_Title")}</TableHeaderCell>
          <TableHeaderCell>{t("Delete_Title")}</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {slackBotConfigs
            .slice(numToDisplay * (page - 1), numToDisplay * page)
            .map((slackBotConfig) => {
              return (
                <TableRow key={slackBotConfig.id}>
                  <TableCell>
                    <div className="flex gap-x-2">
                      <Link
                        className="cursor-pointer my-auto"
                        href={`/admin/bot/${slackBotConfig.id}`}
                      >
                        <EditIcon />
                      </Link>
                      <div className="my-auto">
                        {slackBotConfig.channel_config.channel_names
                          .map((channel_name) => `#${channel_name}`)
                          .join(", ")}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {slackBotConfig.persona &&
                    !isPersonaASlackBotPersona(slackBotConfig.persona) ? (
                      <Link
                        href={`/admin/personas/${slackBotConfig.persona.id}`}
                        className="text-blue-500 flex"
                      >
                        <FiArrowUpRight className="my-auto mr-1" />
                        {slackBotConfig.persona.name}
                      </Link>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell>
                    {" "}
                    <div>
                      {slackBotConfig.persona &&
                      slackBotConfig.persona.document_sets.length > 0
                        ? slackBotConfig.persona.document_sets
                            .map((documentSet) => documentSet.name)
                            .join(", ")
                        : "-"}
                    </div>
                  </TableCell>
                  <TableCell>
                    {" "}
                    <div
                      className="cursor-pointer"
                      onClick={async () => {
                        const response = await deleteSlackBotConfig(
                          slackBotConfig.id
                        );
                        if (response.ok) {
                          setPopup({
                            message: t("Delete_Success_Message", {slack_id: slackBotConfig.id}),
                            type: "success",
                          });
                        } else {
                          const errorMsg = await response.text();
                          setPopup({
                            message: t("Delete_Failed_Message_Prefix", {errorMsg: errorMsg}),
                            type: "error",
                          });
                        }
                        refresh();
                      }}
                    >
                      <TrashIcon />
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
        </TableBody>
      </Table>

      <div className="mt-3 flex">
        <div className="mx-auto">
          <PageSelector
            totalPages={Math.ceil(slackBotConfigs.length / numToDisplay)}
            currentPage={page}
            onPageChange={(newPage) => setPage(newPage)}
          />
        </div>
      </div>
    </div>
  );
};

const Main = () => {
  const t = useTranslations("admin_bot_page");
  const [slackBotTokensModalIsOpen, setSlackBotTokensModalIsOpen] =
    useState(false);
  const { popup, setPopup } = usePopup();
  const {
    data: slackBotConfigs,
    isLoading: isSlackBotConfigsLoading,
    error: slackBotConfigsError,
    refreshSlackBotConfigs,
  } = useSlackBotConfigs();

  const { data: slackBotTokens, refreshSlackBotTokens } = useSlackBotTokens();

  if (isSlackBotConfigsLoading) {
    return <ThreeDotsLoader />;
  }

  if (slackBotConfigsError || !slackBotConfigs) {
    return <div>Error: {slackBotConfigsError}</div>;
  }

  return (
    <div className="mb-8">
      {popup}

      <Text className="mb-2">
        {t("Setup_Slack_Bot")}
      </Text>

      <Text className="mb-2">
        <ul className="list-disc mt-2 ml-4">
          <li>
            {t("Setup_DanswerBot_Auto_Answer")}
          </li>
          <li>
            {t("Choose_Document_Sets")}
          </li>
          <li>
            {t("Directly_DanswerBot")}
          </li>
        </ul>
      </Text>

      <Text className="mb-6">
  {t("Follow_Guide_Prefix")}{" "}
  <a
    className="text-blue-500"
    href="https://docs.danswer.dev/slack_bot_setup"
    target="_blank"
  >
    {t("Follow_Guide_Suffix")}{" "}
  </a>
  {t("Get_Started")}
</Text>

<Title>{t("Step_1_Configure_Slack_Tokens")}</Title>
{!slackBotTokens ? (
  <div className="mt-3">
    <SlackBotTokensForm
      onClose={() => refreshSlackBotTokens()}
      setPopup={setPopup}
    />
  </div>
) : (
  <>
    <Text className="italic mt-3">{t("Tokens_saved")}</Text>
    <Button
      onClick={() => {
        setSlackBotTokensModalIsOpen(!slackBotTokensModalIsOpen);
      }}
      color="blue"
      size="xs"
      className="mt-2"
      icon={slackBotTokensModalIsOpen ? FiChevronUp : FiChevronDown}
    >
            {slackBotTokensModalIsOpen ? t("Hide") : t("Edit_Tokens")}
          </Button>
          {slackBotTokensModalIsOpen && (
            <div className="mt-3">
              <SlackBotTokensForm
                onClose={() => {
                  refreshSlackBotTokens();
                  setSlackBotTokensModalIsOpen(false);
                }}
                setPopup={setPopup}
                existingTokens={slackBotTokens}
              />
            </div>
          )}
        </>
      )}
      {slackBotTokens && (
        <>
          <Title className="mb-2 mt-4">{t("Setup_DanswerBot_Title")}</Title>
          <Text className="mb-3">
            {t("Setup_DanswerBot_Description")}
          </Text>

          <div className="mb-2"></div>

          <Link className="flex mb-3" href="/admin/bot/new">
            <Button className="my-auto" color="green" size="xs">
              {t("New_Slack_Bot_Configuration")}
            </Button>
          </Link>

          {slackBotConfigs.length > 0 && (
            <div className="mt-8">
              <SlackBotConfigsTable
                slackBotConfigs={slackBotConfigs}
                refresh={refreshSlackBotConfigs}
                setPopup={setPopup}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

const Page = () => {
  const t = useTranslations("admin_bot_page");
  return (
    <div className="container mx-auto">
      <AdminPageTitle
        icon={<FiSlack size={32} />}
        title={t("Slack_Bot_Configuration_Title")}
      />
      <InstantSSRAutoRefresh />

      <Main />
    </div>
  );
};

export default Page;
