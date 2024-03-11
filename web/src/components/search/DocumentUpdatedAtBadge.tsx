import {useTranslations} from "next-intl";
import { timeAgo } from "@/lib/time";
import { MetadataBadge } from "../MetadataBadge";

export function DocumentUpdatedAtBadge({ updatedAt }: { updatedAt: string }) {
  const t = useTranslations("components_search_DocumentUpdatedAtBadge");
  return <MetadataBadge value={t("Updated") + " " + timeAgo(updatedAt)} />;
}
