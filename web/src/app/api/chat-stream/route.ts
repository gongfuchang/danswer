import { NextRequest } from "next/server";

async function createStream(req: NextRequest) {
  const prefix = (process.env.SEARCH_SERVER_URL);
  const query_url = prefix ?? "http://127.0.0.1:8080";
  const data = await req.json();
  // console.log(data);
  const res = await fetch(query_url + "/chat/send-message", {
    method: "POST",
    headers: req.headers,
    body: JSON.stringify(data)
});

  return res.body;
}

export async function POST(req: NextRequest) {
  try {
    const stream = await createStream(req);
    return new Response(stream);
  } catch (error) {
    console.trace("[Chat Stream]", error);
    return new Response(
      ["```json\n", JSON.stringify(error, null, "  "), "\n```"].join(""),
    );
  }
}
