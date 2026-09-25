import { writeFile } from "node:fs/promises";
import path from "node:path";
import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { hasAdminCredentials } from "@/lib/adminAuth";
import { parseQuestionSet } from "@/lib/questionSets";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!hasAdminCredentials(request)) {
    return new Response("Authentication required", {
      status: 401,
      headers: { "WWW-Authenticate": 'Basic realm="Krillion admin"' },
    });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File) || !file.name.endsWith(".json")) {
      return NextResponse.json(
        { error: "Upload a JSON file." },
        { status: 400 },
      );
    }

    const contents = await file.text();
    const questionSet = parseQuestionSet(
      JSON.parse(contents) as unknown,
      file.name,
    );
    const id = crypto.randomUUID();

    await writeFile(
      path.join(process.cwd(), "resources", `${id}.json`),
      JSON.stringify(questionSet, null, 2),
      "utf8",
    );
    revalidateTag("question-sets");
    return NextResponse.json({ id });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Invalid JSON file.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
