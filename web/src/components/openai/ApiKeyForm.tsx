import {useTranslations} from "next-intl";
import { Form, Formik } from "formik";
import { Popup } from "../admin/connectors/Popup";
import { useState } from "react";
import { TextFormField } from "../admin/connectors/Field";
import { GEN_AI_API_KEY_URL } from "./constants";
import { LoadingAnimation } from "../Loading";
import { Button } from "@tremor/react";

interface Props {
  handleResponse?: (response: Response) => void;
}

export const ApiKeyForm = ({ handleResponse }: Props) => {
  const t = useTranslations("components_openai_ApiKeyForm");
  const [popup, setPopup] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  return (
    <div>
      {popup && <Popup message={popup.message} type={popup.type} />}
      <Formik
        initialValues={{ apiKey: "" }}
        onSubmit={async ({ apiKey }, formikHelpers) => {
          const response = await fetch(GEN_AI_API_KEY_URL, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ api_key: apiKey }),
          });
          if (handleResponse) {
            handleResponse(response);
          }
          if (response.ok) {
            setPopup({
              message: t("Updated_API_Key"),
              type: "success",
            });
            formikHelpers.resetForm();
          } else {
            const body = await response.json();
            if (body.detail) {
              setPopup({ message: body.detail, type: "error" });
            } else {
              setPopup({
                message: t("Unable_Set_API_Key"),
                type: "error",
              });
            }
            setTimeout(() => {
              setPopup(null);
            }, 10000);
          }
        }}
      >
        {({ isSubmitting }) =>
          isSubmitting ? (
            <div className="text-base">
              <LoadingAnimation text={t("Validating_API_Key")} />
            </div>
          ) : (
            <Form>
              <TextFormField name="apiKey" type="password" label={t("API_Key")} />
              <div className="flex">
                <Button
                  size="xs"
                  type="submit"
                  disabled={isSubmitting}
                  className="w-48 mx-auto"
                >
                  {t("Submit_Button")}
                </Button>
              </div>
            </Form>
          )
        }
      </Formik>
    </div>
  );
};
