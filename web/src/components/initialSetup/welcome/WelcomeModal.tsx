"use client";

import {useTranslations} from "next-intl";
import { Button, Divider, Text } from "@tremor/react";
import { Modal } from "../../Modal";
import Link from "next/link";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { COMPLETED_WELCOME_FLOW_COOKIE } from "./constants";
import { FiCheckCircle, FiMessageSquare, FiShare2 } from "react-icons/fi";
import { useEffect, useState } from "react";
import { BackButton } from "@/components/BackButton";
import { ApiKeyForm } from "@/components/openai/ApiKeyForm";
import { checkApiKey } from "@/components/openai/ApiKeyModal";

function setWelcomeFlowComplete() {
  Cookies.set(COMPLETED_WELCOME_FLOW_COOKIE, "true", { expires: 365 });
}

export function _CompletedWelcomeFlowDummyComponent() {
  setWelcomeFlowComplete();
  return null;
}

function UsageTypeSection({
  title,
  description,
  callToAction,
  icon,
  onClick,
}: {
  title: string;
  description: string | JSX.Element;
  callToAction: string;
  icon?: React.ElementType;
  onClick: () => void;
}) {
  return (
    <div>
      <Text className="font-bold">{title}</Text>
      <div className="text-base mt-1 mb-3">{description}</div>
      <div
        onClick={(e) => {
          e.preventDefault();
          onClick();
        }}
      >
        <div className="text-link font-medium cursor-pointer select-none">
          {callToAction}
        </div>
      </div>
    </div>
  );
}

export function _WelcomeModal() {
  const t = useTranslations("components_initialSetup_welcome_WelcomeModal");
  const router = useRouter();
  const [selectedFlow, setSelectedFlow] = useState<null | "search" | "chat">(
    null
  );
  const [isHidden, setIsHidden] = useState(false);
  const [apiKeyVerified, setApiKeyVerified] = useState<boolean>(false);

  useEffect(() => {
    checkApiKey().then((error) => {
      if (!error) {
        setApiKeyVerified(true);
      }
    });
  }, []);

  if (isHidden) {
    return null;
  }

  let title;
  let body;
  switch (selectedFlow) {
    case "search":
      title = undefined;
      body = (
        <>
          <BackButton behaviorOverride={() => setSelectedFlow(null)} />
          <div className="mt-3">
            <Text className="font-bold mt-6 mb-2 flex">
              {apiKeyVerified && (
                <FiCheckCircle className="my-auto mr-2 text-success" />
              )}
                {t("Search_Step_1")}
            </Text>
            <div>
              {apiKeyVerified ? (
                <div>
                  {t("API_Key_Setup_Complete")}
                  <br /> <br />
                  {t("Change_Key_Later")}
                </div>
              ) : (
                <ApiKeyForm
                  handleResponse={async (response) => {
                    if (response.ok) {
                      setApiKeyVerified(true);
                    }
                  }}
                />
              )}
            </div>
            <Text className="font-bold mt-6 mb-2">
              {t("Connect_Data_Sources")}
            </Text>
            <div>
              <p>
                {t("Connectors_Description")}
              </p>

              <div className="flex mt-3">
                <Link
                  href="/admin/add-connector"
                  onClick={(e) => {
                    e.preventDefault();
                    setWelcomeFlowComplete();
                    router.push("/admin/add-connector");
                  }}
                  className="w-fit mx-auto"
                >
                  <Button size="xs" icon={FiShare2} disabled={!apiKeyVerified}>
                    {t("Setup_Connector_Button")}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </>
      );
      break;
    case "chat":
      title = undefined;
      body = (
        <>
          <BackButton behaviorOverride={() => setSelectedFlow(null)} />

  <div className="mt-3">
    <div>
      {t("Start_Chat_Description")}
      <br />
      <br />
      {t("LLM_Connections_Description")}
      <a
        className="text-link"
        href="https://docs.quick-mind.cn/gen_ai_configs/overview"
      >
        {t("Documentation")}
      </a>
      .
      <br />
      <br />
      {t("Gen_AI_Configs_Description")}
    </div>

    <Text className="font-bold mt-6 mb-2 flex">
      {apiKeyVerified && (
        <FiCheckCircle className="my-auto mr-2 text-success" />
      )}
      {t("Provide_LLM_API_Key")}
    </Text>
    <div>
      {apiKeyVerified ? (
        <div>
          {t("LLM_Setup_Complete")}
          <br /> <br />
          {t("Change_Key_Description")}
        </div>
      ) : (
        <ApiKeyForm
          handleResponse={async (response) => {
            if (response.ok) {
              setApiKeyVerified(true);
            }
          }}
        />
      )}
    </div>

    <Text className="font-bold mt-6 mb-2 flex">
      {t("Start_Chat")}
    </Text>

    <div>
      {t("Start_Chat_Description")}
      <Link
                className="text-link"
                href="/admin/add-connector"
                onClick={(e) => {
                  e.preventDefault();
                  setWelcomeFlowComplete();
                  router.push("/admin/add-connector");
                }}
              >
                {t("Admin_Panel")}
              </Link>
              .
            </div>

            <div className="flex mt-3">
              <Link
                href="/chat"
                onClick={(e) => {
                  e.preventDefault();
                  setWelcomeFlowComplete();
                  router.push("/chat");
                  setIsHidden(true);
                }}
                className="w-fit mx-auto"
              >
                <Button size="xs" icon={FiShare2} disabled={!apiKeyVerified}>
                  {t("Start_chatting")}
                </Button>
              </Link>
            </div>
          </div>
        </>
      );
      break;
    default:
      title = t("Welcome_to_Danswer");
      body = (
        <>
          <div>
            <p>{t("How_are_you_planning_on_using_Danswer")}</p>
          </div>
          <Divider />
          <UsageTypeSection
            title={t("Search_Chat_with_Knowledge")}
            description={
              <div>
                {t("Search_Chat_with_Knowledge_Description")}
              </div>
            }
            callToAction={t("Get_Started")}
            onClick={() => setSelectedFlow("search")}
          />
          <Divider />
          <UsageTypeSection
            title={t("Secure_ChatGPT")}
            description={
              <>
                {t("Secure_ChatGPT_Description")}
              </>
            }
            icon={FiMessageSquare}
            callToAction={t("Get_Started")}
            onClick={() => {
              setSelectedFlow("chat");
            }}
          />

          {/* TODO: add a Slack option here */}
          {/* <Divider />
          <UsageTypeSection
            title="AI-powered Slack Assistant"
            description="If you're looking to setup a bot to auto-answer questions in Slack"
            callToAction="Connect your company knowledge!"
            link="/admin/add-connector"
          /> */}
        </>
      );
  }

  return (
    <Modal title={title} className="max-w-4xl">
      <div className="text-base">{body}</div>
    </Modal>
  );
}
