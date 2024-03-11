"use client";

import {useTranslations} from "next-intl";
import { Button, Divider } from "@tremor/react";
import { Modal } from "../../Modal";
import Link from "next/link";
import { FiMessageSquare, FiShare2 } from "react-icons/fi";
import { useState } from "react";

export function NoSourcesModal() {
  const t = useTranslations("components_initialSetup_search_NoSourcesModal");
  const [isHidden, setIsHidden] = useState(false);

  if (isHidden) {
    return null;
  }

  return (
    <Modal
      className="max-w-4xl"
      title={t("No_Sources_Title")}
      onOutsideClick={() => setIsHidden(true)}
    >
      <div className="text-base">
        <div>
          <p>
            {t("No_Sources_Message")}
          </p>
          <Link href="/admin/add-connector">
            <Button className="mt-3" size="xs" icon={FiShare2}>
              {t("Connect_Source_Button")}
            </Button>
          </Link>
          <Divider />
          <div>
            <p>
              {t("ChatGPT_Message")}
            </p>
            <Link href="/chat">
              <Button className="mt-3" size="xs" icon={FiMessageSquare}>
                {t("Start_Chat_Button")}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Modal>
  );
}
