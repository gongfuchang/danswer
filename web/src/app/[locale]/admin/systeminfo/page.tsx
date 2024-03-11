import {useTranslations} from "next-intl";
import { NotebookIcon } from "@/components/icons/icons";
import { getWebVersion, getBackendVersion } from "@/lib/version";

const Page = async () => {
  const t = useTranslations("admin_systeminfo_page");
  let web_version: string | null = null;
  let backend_version: string | null = null;
  try {
    [web_version, backend_version] = await Promise.all([
      getWebVersion(),
      getBackendVersion(),
    ]);
  } catch (e) {
    console.log(`Version info fetch failed for system info page - ${e}`);
  }

  return (
    <div>
      <div className="border-solid border-gray-600 border-b pb-2 mb-4 flex">
        <NotebookIcon size={26} />
        <h1 className="text-3xl font-bold pl-2">{t("Version_Title")}</h1>
      </div>

      <div>
        <p className="font-bold text-lg my-auto mb-2">Danswer MIT</p>
        <div className="flex mb-2">
          <p className="my-auto mr-1">{t("Backend_Version")}: </p>
          <p className="text-base my-auto text-slate-400 italic">
            {backend_version}
          </p>
        </div>
        <div className="flex mb-2">
          <p className="my-auto mr-1">{t("Web_Version")}: </p>
          <p className="text-base my-auto text-slate-400 italic">
            {web_version}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Page;
