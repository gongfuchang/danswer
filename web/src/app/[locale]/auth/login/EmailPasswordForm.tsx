"use client";

import {useTranslations} from "next-intl";
import { TextFormField } from "@/components/admin/connectors/Field";
import { usePopup } from "@/components/admin/connectors/Popup";
import { basicLogin, basicSignup } from "@/lib/user";
import { Button } from "@tremor/react";
import { Form, Formik } from "formik";
import { useRouter } from "next/navigation";
import * as Yup from "yup";
import { requestEmailVerification } from "../lib";
import { useState } from "react";
import { Spinner } from "@/components/Spinner";

export function EmailPasswordForm({
  isSignup = false,
  shouldVerify,
}: {
  isSignup?: boolean;
  shouldVerify?: boolean;
}) {
  const t = useTranslations("auth_login_Email_Password_Form");
  const router = useRouter();
  const { popup, setPopup } = usePopup();
  const [isWorking, setIsWorking] = useState(false);

  return (
    <>
      {isWorking && <Spinner />}
      {popup}
      <Formik
        initialValues={{
          email: "",
          password: "",
        }}
        validationSchema={Yup.object().shape({
          email: Yup.string().required(t("Email_Required")),
          password: Yup.string().required(t("Password_Required")),
        })}
        onSubmit={async (values) => {
          if (isSignup) {
            // login is fast, no need to show a spinner
            setIsWorking(true);
            const response = await basicSignup(values.email, values.password);

            if (!response.ok) {
              const errorDetail = (await response.json()).detail;

              let errorMsg = t("Unknown_Error");
              if (errorDetail === "REGISTER_USER_ALREADY_EXISTS") {
                errorMsg =
                  t("Account_Exists_Error");
              }
              setPopup({
                type: "error",
                message: t("Failed_Sign_Up", {errorMsg: errorMsg}),
              });
              return;
            }
          }

          const loginResponse = await basicLogin(values.email, values.password);
          if (loginResponse.ok) {
            if (isSignup && shouldVerify) {
              await requestEmailVerification(values.email);
              router.push("/auth/waiting-on-verification");
            } else {
              router.push("/");
            }
          } else {
            setIsWorking(false);
            const errorDetail = (await loginResponse.json()).detail;

            let errorMsg = t("Unknown_Error");
            if (errorDetail === "LOGIN_BAD_CREDENTIALS") {
              errorMsg = t("Invalid_Email_Pwd");
            }
            setPopup({
              type: "error",
              message: t("Failed_Login", {errorMsg: errorMsg}),
            });
          }
        }}
      >
        {({ isSubmitting, values }) => (
          <Form>
            <TextFormField
              name="email"
              label={t("Email")}
              type="email"
              placeholder="email@yourcompany.com"
            />

            <TextFormField
              name="password"
              label={t("Password")}
              type="password"
              placeholder="**************"
            />

            <div className="flex">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="mx-auto w-full"
              >
                {isSignup ? t("Sign_Up") : t("Log_In")}
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </>
  );
}
