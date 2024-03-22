import {useTranslations} from "next-intl";
import { EmphasizedClickable } from "@/components/BasicClickable";
import { FiArchive, FiBook, FiSearch } from "react-icons/fi";

function ForceSearchButton({
  messageId,
  handleShowRetrieved,
}: {
  messageId: number | null;
  isCurrentlyShowingRetrieved: boolean;
  handleShowRetrieved: (messageId: number | null) => void;
}) {
  const t = useTranslations("chat_message_ForceSearchButton");
  return (
    <div
      className="ml-auto my-auto"
      onClick={() => handleShowRetrieved(messageId)}
    >
      <EmphasizedClickable>
        <div className="w-24 text-xs">{t("Force_Search")}</div>
      </EmphasizedClickable>
    </div>
  );
}

export function SkippedSearch({
  handleForceSearch,
}: {
  handleForceSearch: () => void;
}) {
  const t = useTranslations("chat_message_SkippedSearch");
  return (
    <div className="flex text-sm p-1">
      <FiBook className="my-auto mr-2" size={14} />
      <div className="my-2 cursor-default">
        {t("Query_Skipped_Message")}
      </div>

      <div className="ml-auto my-auto" onClick={handleForceSearch}>
        <EmphasizedClickable>
          <div className="w-24 text-xs">{t("Force_Search")}</div>
        </EmphasizedClickable>
      </div>
    </div>
  );
}
