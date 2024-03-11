import {ChatWrapper} from "./ChatWrapper";
export default async function Page({
  searchParams,
}: {
  searchParams: { [key: string]: string };
}) {
  

  return (
    <>
      <ChatWrapper searchParams={searchParams} embeddedMode={false} />
    </>
  );
}
