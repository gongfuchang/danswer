import {ChatWrapper} from "./ChatWrapper";
export default async function Page({
  searchParams,
}: {
  searchParams: { [key: string]: string };
}) {
  

  return await ChatWrapper({searchParams:searchParams, embeddedMode:false});
}
