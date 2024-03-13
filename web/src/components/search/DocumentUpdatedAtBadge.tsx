import {useTranslations} from "next-intl";
import { timeAgo } from "@/lib/time";
import { MetadataBadge } from "../MetadataBadge";

export function DocumentUpdatedAtBadge({ updatedAt }: { updatedAt: string }) {
  const t = useTranslations("components_search_DocumentUpdatedAtBadge");
  const tTimeAgo = useTranslations("components_time_ago");
  return <MetadataBadge value={t("Updated") + " " + timeAgo(tTimeAgo, updatedAt)} />;
}
