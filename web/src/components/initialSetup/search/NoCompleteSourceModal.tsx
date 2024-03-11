"use client";

import {useTranslations} from "next-intl";
import { Modal } from "../../Modal";
import Link from "next/link";
import { useEffect, useState } from "react";
import { CCPairBasicInfo } from "@/lib/types";
import { useRouter } from "next/navigation";

export function NoCompleteSourcesModal({
  ccPairs,
}: {
  ccPairs: CCPairBasicInfo[];
}) {
  const t = useTranslations("components_initialSetup_search_NoCompleteSourceModal");
  const router = useRouter();
  const [isHidden, setIsHidden] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      router.refresh();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  if (isHidden) {
    return null;
  }

  const totalDocs = ccPairs.reduce(
    (acc, ccPair) => acc + ccPair.docs_indexed,
    0
  );

  return (
    <Modal
      className="max-w-4xl"
      title={t("Syncing_Not_Finished_Title")}
      onOutsideClick={() => setIsHidden(true)}
    >
      <div className="text-base">
        <div>
          <div>
            {t("Syncing_Not_Finished_Title_Note")}{" "}
            <b>{totalDocs}</b> {t("Note_Suffix_Documents")}
            <br />
            <br />
            {t("Go_To_Connector_List")}{" "}
            <Link className="text-link" href="admin/indexing/status">
              {t("Existing_Connectors_Page")}
            </Link>
            .
            <br />
            <br />
            <p
              className="text-link cursor-pointer inline"
              onClick={() => {
                setIsHidden(true);
              }}
            >
              {t("Continue_Ask_Questions")}
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
}
