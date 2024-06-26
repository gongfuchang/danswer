import {useTranslations} from "next-intl";
import { AuthType } from "@/lib/constants";
import { FaGoogle } from "react-icons/fa";

export function SignInButton({
  authorizeUrl,
  authType,
}: {
  authorizeUrl: string;
  authType: AuthType;
}) {
  const t = useTranslations("auth_login_SignInButton");
  let button;
  if (authType === "google_oauth") {
    button = (
      <div className="mx-auto flex">
        <div className="my-auto mr-2">
          <FaGoogle />
        </div>
        <p className="text-sm font-medium select-none">{t("Continue_with_Google")}</p>
      </div>
    );
  } else if (authType === "oidc") {
    button = (
      <div className="mx-auto flex">
        <p className="text-sm font-medium select-none">
          {t("Continue_with_OIDC_SSO")}
        </p>
      </div>
    );
  } else if (authType === "saml") {
    button = (
      <div className="mx-auto flex">
        <p className="text-sm font-medium select-none">
          {t("Continue_with_SAML_SSO")}
        </p>
      </div>
    );
  }

  if (!button) {
    throw new Error(`Unhandled authType: ${authType}`);
  }

  return (
    <a
      className="mt-6 py-3 w-72 text-gray-100 bg-accent flex rounded cursor-pointer hover:bg-indigo-800"
      href={authorizeUrl}
    >
      {button}
    </a>
  );
}
