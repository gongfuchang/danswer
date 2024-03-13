import {useTranslations} from "next-intl";
import { getTranslations } from "next-intl/server";
import {
  AuthTypeMetadata,
  getAuthTypeMetadataSS,
  getCurrentUserSS,
} from "@/lib/userSS";
import { redirect } from "next/navigation";
import Image from "next/image";
import { HealthCheckBanner } from "@/components/health/healthcheck";
import { User } from "@/lib/types";
import { Text } from "@tremor/react";
import { RequestNewVerificationEmail } from "./RequestNewVerificationEmail";

export default async function Page() {
  const t = await getTranslations("auth_waitingonverification_page");
  // catch cases where the backend is completely unreachable here
  // without try / catch, will just raise an exception and the page
  // will not render
  let authTypeMetadata: AuthTypeMetadata | null = null;
  let currentUser: User | null = null;
  try {
    [authTypeMetadata, currentUser] = await Promise.all([
      getAuthTypeMetadataSS(),
      getCurrentUserSS(),
    ]);
  } catch (e) {
    console.log(`Some fetch failed for the login page - ${e}`);
  }

  if (!currentUser) {
    if (authTypeMetadata?.authType === "disabled") {
      return redirect("/");
    }
    return redirect("/auth/login");
  }

  if (!authTypeMetadata?.requiresVerification || currentUser.is_verified) {
    return redirect("/");
  }

  return (
    <main>
      <div className="absolute top-10x w-full">
        <HealthCheckBanner />
      </div>
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div>
          <div className="h-16 w-16 mx-auto">
            <Image src="/logo.png" alt="Logo" width="1419" height="1520" />
          </div>

          <div className="flex">
            <Text className="text-center font-medium text-lg mt-6 w-108">
              {t.rich("verification_prompt", {email: currentUser.email, i: (chunks) => (<i>{chunks}</i>)})}
              <br />
              {t("check_inbox")}
              <br />
              <br />
              {t("not_see_email")}{" "}
              <RequestNewVerificationEmail email={currentUser.email}>
                {t("request_new_email")}
              </RequestNewVerificationEmail>{" "}
              {t("to_request_new_email")}
            </Text>
          </div>
        </div>
      </div>
    </main>
  );
}

