"use client";

import {useTranslations} from "next-intl";
import { DocumentSet } from "@/lib/types";
import { Button, Divider, Text } from "@tremor/react";
import {
  ArrayHelpers,
  ErrorMessage,
  Field,
  FieldArray,
  Form,
  Formik,
} from "formik";

import * as Yup from "yup";
import { buildFinalPrompt, createPersona, updatePersona } from "./lib";
import { useRouter } from "next/navigation";
import { usePopup } from "@/components/admin/connectors/Popup";
import { Persona } from "./interfaces";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  BooleanFormField,
  SelectorFormField,
  TextFormField,
} from "@/components/admin/connectors/Field";
import { HidableSection } from "./HidableSection";
import { FiPlus, FiX } from "react-icons/fi";

function Label({ children }: { children: string | JSX.Element }) {
  return (
    <div className="block font-medium text-base text-emphasis">{children}</div>
  );
}

function SubLabel({ children }: { children: string | JSX.Element }) {
  return <div className="text-sm text-subtle mb-2">{children}</div>;
}

export function PersonaEditor({
  existingPersona,
  documentSets,
  llmOverrideOptions,
  defaultLLM,
}: {
  existingPersona?: Persona | null;
  documentSets: DocumentSet[];
  llmOverrideOptions: string[];
  defaultLLM: string;
}) {
  const t = useTranslations("admin_personas_PersonaEditor");
  const router = useRouter();
  const { popup, setPopup } = usePopup();

  const [finalPrompt, setFinalPrompt] = useState<string | null>("");
  const [finalPromptError, setFinalPromptError] = useState<string>("");

  const triggerFinalPromptUpdate = async (
    systemPrompt: string,
    taskPrompt: string,
    retrievalDisabled: boolean
  ) => {
    const response = await buildFinalPrompt(
      systemPrompt,
      taskPrompt,
      retrievalDisabled
    );
    if (response.ok) {
      setFinalPrompt((await response.json()).final_prompt_template);
    }
  };

  const isUpdate = existingPersona !== undefined && existingPersona !== null;
  const existingPrompt = existingPersona?.prompts[0] ?? null;

  useEffect(() => {
    if (isUpdate && existingPrompt) {
      triggerFinalPromptUpdate(
        existingPrompt.system_prompt,
        existingPrompt.task_prompt,
        existingPersona.num_chunks === 0
      );
    }
  }, []);

  return (
    <div>
      {popup}
      <Formik
        enableReinitialize={true}
        initialValues={{
          name: existingPersona?.name ?? "",
          description: existingPersona?.description ?? "",
          system_prompt: existingPrompt?.system_prompt ?? "",
          task_prompt: existingPrompt?.task_prompt ?? "",
          disable_retrieval: (existingPersona?.num_chunks ?? 10) === 0,
          document_set_ids:
            existingPersona?.document_sets?.map(
              (documentSet) => documentSet.id
            ) ?? ([] as number[]),
          num_chunks: existingPersona?.num_chunks ?? null,
          include_citations:
            existingPersona?.prompts[0]?.include_citations ?? true,
          llm_relevance_filter: existingPersona?.llm_relevance_filter ?? false,
          llm_model_version_override:
            existingPersona?.llm_model_version_override ?? null,
          starter_messages: existingPersona?.starter_messages ?? null,
        }}
        validationSchema={Yup.object()
          .shape({
            name: Yup.string().required(t("Persona_Name_Required")),
            description: Yup.string().required(
              t("Persona_Description_Required")
            ),
            system_prompt: Yup.string(),
            task_prompt: Yup.string(),
            disable_retrieval: Yup.boolean().required(),
            document_set_ids: Yup.array().of(Yup.number()),
            num_chunks: Yup.number().max(20).nullable(),
            include_citations: Yup.boolean().required(),
            llm_relevance_filter: Yup.boolean().required(),
            llm_model_version_override: Yup.string().nullable(),
            starter_messages: Yup.array().of(
              Yup.object().shape({
                name: Yup.string().required(),
                description: Yup.string().required(),
                message: Yup.string().required(),
              })
            ),
          })
          .test(
            "system-prompt-or-task-prompt",
            t("System_Task_Prompt_Validation"),
            (values) => {
              const systemPromptSpecified = values.system_prompt
                ? values.system_prompt.length > 0
                : false;
              const taskPromptSpecified = values.task_prompt
                ? values.task_prompt.length > 0
                : false;
              if (systemPromptSpecified || taskPromptSpecified) {
                setFinalPromptError("");
                return true;
              } // Return true if at least one field has a value

              setFinalPromptError(
                t("System_Task_Prompt_Required")
              );
            }
          )}
        onSubmit={async (values, formikHelpers) => {
          if (finalPromptError) {
            setPopup({
              type: "error",
              message: t("Submit_Error_Message"),
            });
            return;
          }

          formikHelpers.setSubmitting(true);

          // if disable_retrieval is set, set num_chunks to 0
          // to tell the backend to not fetch any documents
          const numChunks = values.disable_retrieval
            ? 0
            : values.num_chunks || 10;

          let promptResponse;
          let personaResponse;
          if (isUpdate) {
            [promptResponse, personaResponse] = await updatePersona({
              id: existingPersona.id,
              existingPromptId: existingPrompt?.id,
              ...values,
              num_chunks: numChunks,
            });
          } else {
            [promptResponse, personaResponse] = await createPersona({
              ...values,
              num_chunks: numChunks,
            });
          }

          let error = null;
          if (!promptResponse.ok) {
            error = await promptResponse.text();
          }
          if (personaResponse && !personaResponse.ok) {
            error = await personaResponse.text();
          }

          if (error) {
            setPopup({
              type: "error",
              message: t("Failed_Create_Persona", {error: error}),
            });
            formikHelpers.setSubmitting(false);
          } else {
            router.push(`/admin/personas?u=${Date.now()}`);
          }
        }}
      >
        {({ isSubmitting, values, setFieldValue }) => (
          <Form>
            <div className="pb-6">
              <HidableSection sectionTitle={t("Who_Am_I")}>
                <>
                  <TextFormField
                    name="name"
                    label={t("Name")}
                    disabled={isUpdate}
                    subtext={t("Name_Subtext")}
                  />

                  <TextFormField
                    name="description"
                    label={t("Description")}
                    subtext={t("Description_Subtext")}
                  />
                </>
              </HidableSection>

              <Divider />

              <HidableSection sectionTitle={t("Customize_Response_Style")}>
                <>
                  <TextFormField
                    name="system_prompt"
                    label={t("System_Prompt")}
                    isTextArea={true}
                    subtext={
                      t("System_Prompt_Subtext")
                    }
                    onChange={(e) => {
                      setFieldValue("system_prompt", e.target.value);
                      triggerFinalPromptUpdate(
                        e.target.value,
                        values.task_prompt,
                        values.disable_retrieval
                      );
                    }}
                    error={finalPromptError}
                  />

                  <TextFormField
                    name="task_prompt"
                    label={t("Task_Prompt")}
                    isTextArea={true}
                    subtext={
                      t("Task_Prompt_Subtext")
                    }
                    onChange={(e) => {
                      setFieldValue("task_prompt", e.target.value);
                      triggerFinalPromptUpdate(
                        values.system_prompt,
                        e.target.value,
                        values.disable_retrieval
                      );
                    }}
                    error={finalPromptError}
                  />

                  {!values.disable_retrieval && (
                    <BooleanFormField
                      name="include_citations"
                      label={t("Include_Citations")}
                      subtext={t("Include_Citations_Subtext")}
                      />
                  )}

                  <BooleanFormField
                    name="disable_retrieval"
                    label={t("Disable_Retrieval")}
                    subtext={t("Disable_Retrieval_Subtext")}
                    onChange={(e) => {
                      setFieldValue("disable_retrieval", e.target.checked);
                      triggerFinalPromptUpdate(
                        values.system_prompt,
                        values.task_prompt,
                        e.target.checked
                      );
                    }}
                  />

                  <Label>{t("Final_Prompt")}</Label>

                  {finalPrompt ? (
                    <pre className="text-sm mt-2 whitespace-pre-wrap">
                      {finalPrompt}
                    </pre>
                  ) : (
                    "-"
                  )}
                </>
              </HidableSection>

              <Divider />

              {!values.disable_retrieval && (
                <>
                  <HidableSection sectionTitle={t("Data_Access_Title")}>
                    <>
                      <FieldArray
                        name="document_set_ids"
                        render={(arrayHelpers: ArrayHelpers) => (
                          <div>
                            <div>
                              <SubLabel>
                                <>
                                  {t("Select_Which")}{" "}
                                  <Link
                                    href="/admin/documents/sets"
                                    className="text-blue-500"
                                    target="_blank"
                                  >
                                    {t("Document_Sets")}
                                  </Link>{" "}
                                  {t("Persona_Search_Description")}
                                </>
                              </SubLabel>
                            </div>
                            <div className="mb-3 mt-2 flex gap-2 flex-wrap text-sm">
                              {documentSets.map((documentSet) => {
                                const ind = values.document_set_ids.indexOf(
                                  documentSet.id
                                );
                                let isSelected = ind !== -1;
                                return (
                                  <div
                                    key={documentSet.id}
                                    className={
                                      `
                                      px-3 
                                      py-1
                                      rounded-lg 
                                      border
                                      border-border
                                      w-fit 
                                      flex 
                                      cursor-pointer ` +
                                      (isSelected
                                        ? " bg-hover"
                                        : " bg-background hover:bg-hover-light")
                                    }
                                    onClick={() => {
                                      if (isSelected) {
                                        arrayHelpers.remove(ind);
                                      } else {
                                        arrayHelpers.push(documentSet.id);
                                      }
                                    }}
                                  >
                                    <div className="my-auto">
                                      {documentSet.name}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      />
                    </>
                  </HidableSection>

                  <Divider />
                </>
              )}

            {llmOverrideOptions.length > 0 && defaultLLM && (
              <>
                <HidableSection sectionTitle={t("Advanced_Model_Selection")}>
                  <>
                    <Text>
                      {t.rich("Model_Selection_Description", {
                        i: (chunks) => (<i>{chunks}</i>), 
                        b: (chunks) => (<b>{chunks}</b>),                        
                        defaultLLM: defaultLLM
                      })}
                      <br />
                      <br />
                      {t("Model_Selection_More_Info_P1")}{" "}
                      <a
                        href="https://platform.openai.com/docs/models"
                        target="_blank"
                        className="text-blue-500"
                      >
                        {t("Model_Selection_More_Info_P2")}
                      </a>
                      .
                    </Text>

                      <div className="w-96">
                        <SelectorFormField
                          name="llm_model_version_override"
                          options={llmOverrideOptions.map((llmOption) => {
                            return {
                              name: llmOption,
                              value: llmOption,
                            };
                          })}
                          includeDefault={true}
                        />
                      </div>
                    </>
                  </HidableSection>

                  <Divider />
                </>
              )}

              {!values.disable_retrieval && (
                <>
                  <HidableSection sectionTitle={t("Advanced_Retrieval_Customization")}>
                    <>
                      <TextFormField
                        name="num_chunks"
                        label={t("Number_Chunks")}
                        subtext={
                          <div>
                            {t("Number_Chunks_Description")}
                            <br />
                            <br />
                            {t("Number_Chunks_More_Info")}
                          </div>
                        }
                        onChange={(e) => {
                          const value = e.target.value;
                          // Allow only integer values
                          if (value === "" || /^[0-9]+$/.test(value)) {
                            setFieldValue("num_chunks", value);
                          }
                        }}
                      />

                      <BooleanFormField
                        name="llm_relevance_filter"
                        label={t("Apply_LLM_Filter")}
                        subtext={
                          t("Apply_LLM_Filter_Subtext")
                        }
                      />
                    </>
                  </HidableSection>

                  <Divider />
                </>
              )}



              <Divider />

              <div className="flex">
                <Button
                  className="mx-auto"
                  color="green"
                  size="md"
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isUpdate ? t("Update_Button") : t("Create_Button")}
                </Button>
              </div>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
}
