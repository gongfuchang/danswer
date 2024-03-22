import { getTranslations } from "next-intl/server";
import {ChatWrapper} from "../../chat/ChatWrapper";
import { AdminPageTitle } from "@/components/admin/Title";
import { FiMessageSquare } from "react-icons/fi";;

export default async function Page({
  searchParams,
}: {
  searchParams: { [key: string]: string };
}) {

  const t = await getTranslations("admin_chat_page");
  return (
    <div className="mx-auto container">
      <AdminPageTitle title={t("Chat_Title")} icon={<FiMessageSquare size={26} />} />

      <div style={{padding: 0}}>
        {await ChatWrapper({searchParams:searchParams, embeddedMode:true})}
      </div>
    </div>
  );
}