import {getTranslations} from 'next-intl/server';
import { AdminPageTitle } from "@/components/admin/Title";
import { ZoomInIcon } from "@/components/icons/icons";
import { Explorer } from "./Explorer";
import { fetchValidFilterInfo } from "@/lib/search/utilsSS";

const Page = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string };
}) => {
  const t = await getTranslations('admin_documents_explorer_page');
  const { connectors, documentSets } = await fetchValidFilterInfo();

  return (
    <div className="mx-auto container">
      <AdminPageTitle
        icon={<ZoomInIcon size={26} />}
        title={t("Document_Explorer_Title")}
      />

      <Explorer
        initialSearchValue={searchParams.query}
        connectors={connectors}
        documentSets={documentSets}
      />
    </div>
  );
};

export default Page;
