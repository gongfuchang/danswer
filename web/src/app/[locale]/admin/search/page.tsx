import {useTranslations} from "next-intl";
import { SearchWrapper } from "../../search/SearchWrapper";
import { SearchType } from "@/lib/search/interfaces";

import { AdminPageTitle } from "@/components/admin/Title";
import { FiSearch } from "react-icons/fi";;


const Page = async () => {
  const t = useTranslations("admin_search_page");
  return (
    <div className="mx-auto container">
      <AdminPageTitle title={t("Search_Title")} icon={<FiSearch size={26} />} />

      <div>
        {await SearchWrapper({searchTypeDefault:SearchType.SEMANTIC})}
      </div>
    </div>
  );
};

export default Page;
