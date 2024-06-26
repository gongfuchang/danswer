import {useTranslations} from "next-intl";
import { Form, Formik } from "formik";
import * as Yup from "yup";
import { PopupSpec } from "@/components/admin/connectors/Popup";
import { SlackBotTokens } from "@/lib/types";
import {
  TextArrayField,
  TextFormField,
} from "@/components/admin/connectors/Field";
import {
  createSlackBotConfig,
  setSlackBotTokens,
  updateSlackBotConfig,
} from "./lib";
import { Button, Card } from "@tremor/react";

interface SlackBotTokensFormProps {
  onClose: () => void;
  setPopup: (popupSpec: PopupSpec | null) => void;
  existingTokens?: SlackBotTokens;
}

export const SlackBotTokensForm = ({
  onClose,
  setPopup,
  existingTokens,
}: SlackBotTokensFormProps) => {
  const t = useTranslations("admin_bot_SlackBotTokensForm");
  return (
    <Card>
      <Formik
        initialValues={existingTokens || { app_token: "", bot_token: "" }}
        validationSchema={Yup.object().shape({
          channel_names: Yup.array().of(Yup.string().required()),
          document_sets: Yup.array().of(Yup.number()),
        })}
        onSubmit={async (values, formikHelpers) => {
          formikHelpers.setSubmitting(true);
          const response = await setSlackBotTokens(values);
          formikHelpers.setSubmitting(false);
          if (response.ok) {
            setPopup({
              message: t("Success_Setting_Slack_Tokens"),
              type: "success",
            });
            onClose();
          } else {
            const errorMsg = await response.text();
            setPopup({
              message: t("Error_Setting_Slack_Tokens", {errorMsg: errorMsg}),
              type: "error",
            });
}
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <TextFormField
              name="bot_token"
              label={t("Slack_Bot_Token")}
              type="password"
            />
            <TextFormField
              name="app_token"
              label={t("Slack_App_Token")}
              type="password"
            />
            <div className="flex">
              <Button type="submit" disabled={isSubmitting}>
                {t("Set_Tokens")}
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </Card>
  );
};
