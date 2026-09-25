import { redirect } from "next/navigation";
import { listQuestionSetIds } from "@/lib/questionSets";

export const dynamic = "force-dynamic";

export default async function RandomQuestionSetPage() {
  const availableIds = (await listQuestionSetIds()).filter((id) => id !== "0");
  const id = availableIds.length
    ? availableIds[Math.floor(Math.random() * availableIds.length)]
    : "0";

  redirect(`/${id}`);
}
