"use client";

import {useTranslations} from "next-intl";
import { ArrayHelpers, FieldArray, Form, Formik } from "formik";
import * as Yup from "yup";
import { usePopup } from "@/components/admin/connectors/Popup";
import { DocumentSet, SlackBotConfig } from "@/lib/types";
import {
  BooleanFormField,
  SectionHeader,
  SelectorFormField,
  SubLabel,
  TextArrayField,
} from "@/components/admin/connectors/Field";
import {
  createSlackBotConfig,
  isPersonaASlackBotPersona,
  updateSlackBotConfig,
} from "./lib";
import {
  Button,
  Card,
  Divider,
  Tab,
  TabGroup,
  TabList,
  TabPanel,
  TabPanels,
  Text,
} from "@tremor/react";
import { useRouter } from "next/navigation";
import { Persona } from "../personas/interfaces";
import { useState } from "react";
import { BookmarkIcon, RobotIcon } from "@/components/icons/icons";

export const SlackBotCreationForm = ({
  documentSets,
  personas,
  existingSlackBotConfig,
}: {
  documentSets: DocumentSet[];
  personas: Persona[];
  existingSlackBotConfig?: SlackBotConfig;
}) => {
  const t = useTranslations("admin_bot_SlackBotConfigCreationForm");
  const isUpdate = existingSlackBotConfig !== undefined;
  const { popup, setPopup } = usePopup();
  const router = useRouter();

  const existingSlackBotUsesPersona = existingSlackBotConfig?.persona
    ? !isPersonaASlackBotPersona(existingSlackBotConfig.persona)
    : false;
  const [usingPersonas, setUsingPersonas] = useState(
    existingSlackBotUsesPersona
  );

  return (
    <div>
      <Card>
        {popup}
        <Formik
          initialValues={{
            channel_names: existingSlackBotConfig
              ? existingSlackBotConfig.channel_config.channel_names
              : ([] as string[]),
            answer_validity_check_enabled: (
              existingSlackBotConfig?.channel_config?.answer_filters || []
            ).includes("well_answered_postfilter"),
            questionmark_prefilter_enabled: (
              existingSlackBotConfig?.channel_config?.answer_filters || []
            ).includes("questionmark_prefilter"),
            respond_tag_only:
              existingSlackBotConfig?.channel_config?.respond_tag_only || false,
            respond_to_bots:
              existingSlackBotConfig?.channel_config?.respond_to_bots || false,
            respond_team_member_list:
              existingSlackBotConfig?.channel_config
                ?.respond_team_member_list || ([] as string[]),
            still_need_help_enabled:
              existingSlackBotConfig?.channel_config?.follow_up_tags !==
              undefined,
            follow_up_tags:
              existingSlackBotConfig?.channel_config?.follow_up_tags,
            document_sets:
              existingSlackBotConfig && existingSlackBotConfig.persona
                ? existingSlackBotConfig.persona.document_sets.map(
                    (documentSet) => documentSet.id
                  )
                : ([] as number[]),
            persona_id:
              existingSlackBotConfig?.persona &&
              !isPersonaASlackBotPersona(existingSlackBotConfig.persona)
                ? existingSlackBotConfig.persona.id
                : null,
            response_type: existingSlackBotConfig?.response_type || "citations",
          }}
          validationSchema={Yup.object().shape({
            channel_names: Yup.array().of(Yup.string()),
            response_type: Yup.string()
              .oneOf(["quotes", "citations"])
              .required(),
            answer_validity_check_enabled: Yup.boolean().required(),
            questionmark_prefilter_enabled: Yup.boolean().required(),
            respond_tag_only: Yup.boolean().required(),
            respond_to_bots: Yup.boolean().required(),
            respond_team_member_list: Yup.array().of(Yup.string()).required(),
            still_need_help_enabled: Yup.boolean().required(),
            follow_up_tags: Yup.array().of(Yup.string()),
            document_sets: Yup.array().of(Yup.number()),
            persona_id: Yup.number().nullable(),
          })}
          onSubmit={async (values, formikHelpers) => {
            formikHelpers.setSubmitting(true);

            // remove empty channel names
            const cleanedValues = {
              ...values,
              channel_names: values.channel_names.filter(
                (channelName) => channelName !== ""
              ),
              respond_team_member_list: values.respond_team_member_list.filter(
                (teamMemberEmail) => teamMemberEmail !== ""
              ),
              usePersona: usingPersonas,
            };
            if (!cleanedValues.still_need_help_enabled) {
              cleanedValues.follow_up_tags = undefined;
            } else {
              if (!cleanedValues.follow_up_tags) {
                cleanedValues.follow_up_tags = [];
              }
            }

            let response;
            if (isUpdate) {
              response = await updateSlackBotConfig(
                existingSlackBotConfig.id,
                cleanedValues
              );
            } else {
              response = await createSlackBotConfig(cleanedValues);
            }
            formikHelpers.setSubmitting(false);
            if (response.ok) {
              router.push(`/admin/bot?u=${Date.now()}`);
            } else {
              const responseJson = await response.json();
              const errorMsg = responseJson.detail || responseJson.message;
              setPopup({
                message: isUpdate
                  ? t("Response_Updating_Error", {errorMsg: errorMsg})
                  : t("Response_Creating_Error", {errorMsg: errorMsg}),
                type: "error",
              });
            }
          }}
        >
          {({ isSubmitting, values }) => (
            <Form>
              <div className="px-6 pb-6">
                <SectionHeader>{t("The_Basics_Header")}</SectionHeader>

                <TextArrayField
                  name="channel_names"
                  label={t("Channel_Names")}
                  values={values}
                  subtext={
                    <div>
                      {t("Tips_Slack_Channel")}
                      <br />
                      <br />
                      {t.rich("Note_Add_DanswerBot_to_Channel", {i: (chunks) => (<i>{chunks}</i>), b: (chunks) => (<b>{chunks}</b>)})}
                    </div>
                  }
                />

                <SelectorFormField
                  name="response_type"
                  label={t("Response_Format_Label")}
                  subtext={
                    <>
                      {t("Citations_Tips")}
                      <br />
                      <br />
                      {t("Quotes_Tips")}
                    </>
                  }
                  options={[
                    { name: "Citations", value: "citations" },
                    { name: "Quotes", value: "quotes" },
                  ]}
                />

                <Divider />

                <SectionHeader>{t("When_Respond_DanswerBot")}</SectionHeader>

                <BooleanFormField
                  name="answer_validity_check_enabled"
                  label={t("Hide_Non_Answers")}
                  subtext={t("Answer_Validity_Check_Subtext")}
                />
                <BooleanFormField
                  name="questionmark_prefilter_enabled"
                  label={t("Only_Respond_Questions")}
                  subtext={t("Questionmark_Prefilter_Subtext")}
                />
                <BooleanFormField
                  name="respond_tag_only"
                  label={t("Respond_DanswerBot_Only")}
                  subtext={t("Respond_Tag_Only_Subtext")}
                />
                <BooleanFormField
                  name="respond_to_bots"
                  label={t("Respond_To_Bots")}
                  subtext={t("Respond_To_Bots_Subtext")}
                />
                <TextArrayField
                  name="respond_team_member_list"
                  label={t("Team_Members_Emails")}
                  subtext={t("Team_Members_Emails_Subtext")}
                  values={values}
                />
                <Divider />

                <SectionHeader>{t("Post_Response_Behavior")}</SectionHeader>

                <BooleanFormField
                  name="still_need_help_enabled"
                  label={t("Should_Danswer_Still_Need_Help_Button")}
                  subtext={t("Still_Need_Help_Button_Subtext")}
                />
                {values.still_need_help_enabled && (
                  <TextArrayField
                    name="follow_up_tags"
                    label={t("Users_to_Tag")}
                    values={values}
                    subtext={
                      <div>
                      {t("Slack_Users_Tag_Description")}
                      <br />
                      {t("Provide_User_Group_Description")}
                      <br />
                      <br />
                      {t("No_Email_Tagging_Description")}
                      </div>
                    }
                  />
                )}

                <Divider />

                <div>
                  <SectionHeader>
                    {t("Data_Sources_Prompts_Header")}
                  </SectionHeader>
                  <Text>
                    {t.rich("Use_Persona_Document_Sets", {i: (chunks) => (<i>{chunks}</i>), b: (chunks) => (<b>{chunks}</b>)})}
                  </Text>
                  <Text>
                    <ul className="list-disc mt-2 ml-4">
                      <li>
                        {t("Use_Persona_Customize_Prompt")}
                      </li>
                      <li>
                        {t("Use_Document_Sets_Control_Documents")}
                      </li>
                    </ul>
                  </Text>
                  <Text className="mt-2">
                    {t.rich("Note_Submit_Form_Tab", {i: (chunks) => (<i>{chunks}</i>), b: (chunks) => (<b>{chunks}</b>)})}
                  </Text>
                </div>

                <TabGroup
                  index={usingPersonas ? 1 : 0}
                  onIndexChange={(index) => setUsingPersonas(index === 1)}
                >
                  <TabList className="mt-3 mb-4">
                    <Tab icon={BookmarkIcon}>{t("Document_Sets")}</Tab>
                    <Tab icon={RobotIcon}>{t("Personas")}</Tab>
                  </TabList>
                  <TabPanels>
                    <TabPanel>
                      <FieldArray
                        name="document_sets"
                        render={(arrayHelpers: ArrayHelpers) => (
                          <div>
                            <div>
                              <SubLabel>
                                {t("Document_Sets_Description")}
                              </SubLabel>
                            </div>
                            <div className="mb-3 mt-2 flex gap-2 flex-wrap text-sm">
                              {documentSets.map((documentSet) => {
                                const ind = values.document_sets.indexOf(
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
                    </TabPanel>
                    <TabPanel>
                      <SelectorFormField
                        name="persona_id"
                        subtext={t("Persona_Subtext")}
                        options={personas.map((persona) => {
                          return {
                            name: persona.name,
                            value: persona.id,
                          };
                        })}
                      />
                    </TabPanel>
                  </TabPanels>
                </TabGroup>

                <Divider />

                <div className="flex">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="mx-auto w-64"
                  >
                    {isUpdate ? t("Update_Button") : t("Create_Button")}
                  </Button>
                </div>
              </div>
            </Form>
          )}
        </Formik>
      </Card>
    </div>
  );
};