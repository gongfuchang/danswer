"use client";

import {useTranslations} from "next-intl";
import { LoadingAnimation, ThreeDotsLoader } from "@/components/Loading";
import { AdminPageTitle } from "@/components/admin/Title";
import { KeyIcon, TrashIcon } from "@/components/icons/icons";
import { ApiKeyForm } from "@/components/openai/ApiKeyForm";
import { GEN_AI_API_KEY_URL } from "@/components/openai/constants";
import { errorHandlingFetcher, fetcher } from "@/lib/fetcher";
import { Button, Divider, Text, Title } from "@tremor/react";
import { FiCpu, FiPackage } from "react-icons/fi";
import useSWR, { mutate } from "swr";
import { ModelOption, ModelSelector } from "./ModelSelector";
import { useState } from "react";
import { ModelSelectionConfirmaionModal } from "./ModelSelectionConfirmation";
import { ReindexingProgressTable } from "./ReindexingProgressTable";
import { Modal } from "@/components/Modal";
import {
  AVAILABLE_MODELS,
  EmbeddingModelResponse,
  INVALID_OLD_MODEL,
} from "./embeddingModels";
import { ErrorCallout } from "@/components/ErrorCallout";
import { Connector, ConnectorIndexingStatus } from "@/lib/types";
import Link from "next/link";

function Main() {
  const t = useTranslations("admin_models_embedding_page");
  const [tentativeNewEmbeddingModel, setTentativeNewEmbeddingModel] = useState<
    string | null
  >(null);
  const [isCancelling, setIsCancelling] = useState<boolean>(false);
  const [showAddConnectorPopup, setShowAddConnectorPopup] =
    useState<boolean>(false);

  const {
    data: currentEmeddingModel,
    isLoading: isLoadingCurrentModel,
    error: currentEmeddingModelError,
  } = useSWR<EmbeddingModelResponse>(
    "/api/secondary-index/get-current-embedding-model",
    errorHandlingFetcher,
    { refreshInterval: 5000 } // 5 seconds
  );
  const {
    data: futureEmeddingModel,
    isLoading: isLoadingFutureModel,
    error: futureEmeddingModelError,
  } = useSWR<EmbeddingModelResponse>(
    "/api/secondary-index/get-secondary-embedding-model",
    errorHandlingFetcher,
    { refreshInterval: 5000 } // 5 seconds
  );
  const {
    data: ongoingReIndexingStatus,
    isLoading: isLoadingOngoingReIndexingStatus,
  } = useSWR<ConnectorIndexingStatus<any, any>[]>(
    "/api/manage/admin/connector/indexing-status?secondary_index=true",
    errorHandlingFetcher,
    { refreshInterval: 5000 } // 5 seconds
  );
  const { data: connectors } = useSWR<Connector<any>[]>(
    "/api/manage/connector",
    errorHandlingFetcher,
    { refreshInterval: 5000 } // 5 seconds
  );

  const onSelect = async (modelName: string) => {
    if (currentEmeddingModel?.model_name === INVALID_OLD_MODEL) {
      await onConfirm(modelName);
    } else {
      setTentativeNewEmbeddingModel(modelName);
    }
  };

  const onConfirm = async (modelName: string) => {
    const modelDescriptor = AVAILABLE_MODELS.find(
      (model) => model.model_name === modelName
    );

    const response = await fetch(
      "/api/secondary-index/set-new-embedding-model",
      {
        method: "POST",
        body: JSON.stringify(modelDescriptor),
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    if (response.ok) {
      setTentativeNewEmbeddingModel(null);
      mutate("/api/secondary-index/get-secondary-embedding-model");
      if (!connectors || !connectors.length) {
        setShowAddConnectorPopup(true);
      }
    } else {
      alert(t("Failed_Update_Model", {model: await response.text()}));
    }
  };

  const onCancel = async () => {
    const response = await fetch("/api/secondary-index/cancel-new-embedding", {
      method: "POST",
    });
    if (response.ok) {
      setTentativeNewEmbeddingModel(null);
      mutate("/api/secondary-index/get-secondary-embedding-model");
    } else {
      alert(
        `Failed to cancel embedding model update - ${await response.text()}`
      );
    }

    setIsCancelling(false);
  };

  if (isLoadingCurrentModel || isLoadingFutureModel) {
    return <ThreeDotsLoader />;
  }

  if (
    currentEmeddingModelError ||
    !currentEmeddingModel ||
    futureEmeddingModelError ||
    !futureEmeddingModel
  ) {
    return <ErrorCallout errorTitle={t("Failed_to_Fetch_Model_Status")} />;
  }

  const currentModelName = currentEmeddingModel.model_name;
  const currentModel = AVAILABLE_MODELS.find(
    (model) => model.model_name === currentModelName
  );

  const newModelSelection = AVAILABLE_MODELS.find(
    (model) => model.model_name === futureEmeddingModel.model_name
  );

  return (
    <div>
      {tentativeNewEmbeddingModel && (
        <ModelSelectionConfirmaionModal
          selectedModel={tentativeNewEmbeddingModel}
          onConfirm={() => onConfirm(tentativeNewEmbeddingModel)}
          onCancel={() => setTentativeNewEmbeddingModel(null)}
        />
      )}

      {showAddConnectorPopup && (
        <Modal>
          <div>
            <div>
              <b className="text-base">{t("Success_Model_Selection")}</b>{" "}
              🙌
              <br />
              <br />
              {t("Initial_Setup_Message")}
              <br />
              <br />
              {t("Connectors_Description")}
            </div>
            <div className="flex">
              <Link className="mx-auto mt-2 w-fit" href="/admin/add-connector">
                <Button className="mt-3 mx-auto" size="xs">
                  {t("Add_Connector")}
                </Button>
              </Link>
            </div>
          </div>
        </Modal>
      )}

      {isCancelling && (
        <Modal
          onOutsideClick={() => setIsCancelling(false)}
          title={t("Cancel_Model_Switch")}
        >
          <div>
            <div>
              {t("Cancel_Confirmation_Message")}
              <br />
              <br />
              {t("Cancel_Progress_Message")}
            </div>
            <div className="flex">
              <Button onClick={onCancel} className="mt-3 mx-auto" color="green">
                {t("Confirm")}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      <Text>
        {t("Embedding_Models_Description")}
      </Text>

      {currentModel ? (
        <>
          <Title className="mt-8 mb-2">{t("Current_Embedding_Model")}</Title>

          <Text>
            <ModelOption model={currentModel} />
          </Text>
        </>
      ) : (
        newModelSelection &&
        (!connectors || !connectors.length) && (
          <>
            <Title className="mt-8 mb-2">{t("Current_Embedding_Model")}</Title>

            <Text>
              <ModelOption model={newModelSelection} />
            </Text>
          </>
        )
      )}

      {!showAddConnectorPopup &&
        (!newModelSelection ? (
          <div>
            {currentModel ? (
              <>
                <Title className="mt-8">{t("Switch_Embedding_Model")}</Title>

                <Text className="mb-4">
                  {t("Update_Model_Choice")}
                </Text>
              </>
            ) : (
              <>
                <Title className="mt-8 mb-4">{t("Choose_Embedding_Model")}</Title>
              </>
            )}

            <ModelSelector
              modelOptions={AVAILABLE_MODELS.filter(
                (modelOption) => modelOption.model_name !== currentModelName
              )}
              setSelectedModel={onSelect}
            />
          </div>
        ) : (
          connectors &&
          connectors.length > 0 && (
            <div>
              <Title className="mt-8">{t("Current_Upgrade_Status")}</Title>
              <div className="mt-4">
                <div className="italic text-sm mb-2">
                  {t("Switching_Process_Message")}
                </div>
                <ModelOption model={newModelSelection} />

                <Button
                  color="red"
                  size="xs"
                  className="mt-4"
                  onClick={() => setIsCancelling(true)}
                >
                  {t("Cancel")}
                </Button>

                <Text className="my-4">
                  {t("Reindexing_Progress_Message")}
                </Text>

                {isLoadingOngoingReIndexingStatus ? (
                  <ThreeDotsLoader />
                ) : ongoingReIndexingStatus ? (
                  <ReindexingProgressTable
                    reindexingProgress={ongoingReIndexingStatus}
                  />
                ) : (
                  <ErrorCallout errorTitle={t("Failed_Fetch_Reindexing_Progress")} />
                )}
              </div>
            </div>
          )
        ))}
    </div>
  );
}

function Page() {
  const t = useTranslations("admin_models_embedding_page");
  return (
    <div className="mx-auto container">
      <AdminPageTitle
        title={t("Embedding_Title")}
        icon={<FiPackage size={26} className="my-auto" />}
      />

      <Main />
    </div>
  );
}

export default Page;
