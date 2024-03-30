import { Header } from "@/components/Header";
import { cookies, headers } from "next/headers";
import { SearchType } from "@/lib/search/interfaces";
import {
  AuthTypeMetadata,
  getAuthTypeMetadataSS,
  getCurrentUserSS,
} from "@/lib/userSS";
import { redirect } from "next/navigation";
import { HealthCheckBanner } from "@/components/health/healthcheck";
import { unstable_noStore as noStore } from "next/cache";
import { User } from "@/lib/types";
import { SearchWrapper } from "./SearchWrapper";

export default async function Home() {
  noStore();

  const tasks = [
    getAuthTypeMetadataSS(),
    getCurrentUserSS(),
  ];

  let results: (
    | User
    | Response
    | AuthTypeMetadata
    | null
  )[] = [null, null];
  try {
    results = await Promise.all(tasks);
  } catch (e) {
    console.log(`Some fetch failed for the main search page - ${e}`);
  }
  const authTypeMetadata = results[0] as AuthTypeMetadata | null;
  const user = results[1] as User | null;

  const authDisabled = authTypeMetadata?.authType === "disabled";
  if (!authDisabled && !user) {
    const headersList = headers();
    return redirect("/auth/login" + (headersList.get("referer") ? `?next=${headersList.get("referer")}` : ""));
  }

  if (user && !user.is_verified && authTypeMetadata?.requiresVerification) {
    return redirect("/auth/waiting-on-verification");
  }
  // needs to be done in a non-client side component due to nextjs
  const storedSearchType = cookies().get("searchType")?.value as
    | string
    | undefined;
  let searchTypeDefault: SearchType =
    storedSearchType !== undefined &&
    SearchType.hasOwnProperty(storedSearchType)
      ? (storedSearchType as SearchType)
      : SearchType.SEMANTIC; // default to semantic

  return (
    <>
      <Header user={user} />
      <div className="m-3">
        <HealthCheckBanner />
      </div>
      {await SearchWrapper({searchTypeDefault:searchTypeDefault})}
    </>
  );
}
