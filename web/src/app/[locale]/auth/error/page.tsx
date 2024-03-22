import { useTranslations } from "next-intl";

const Page = () => {
  const t = useTranslations("auth_error_page");
  return (
    <div>{t("Login_Error_Message")}</div>
  );
};

export default Page;
