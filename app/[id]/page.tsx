import { DiveGame } from "@/components/DiveGame";
import { getQuestionSet } from "@/lib/questionSets";
import { notFound } from "next/navigation";

export const revalidate = 60;

export default async function QuestionSetPage({
  params,
}: {
  params: { id: string };
}) {
  try {
    const questionSet = await getQuestionSet(params.id);
    return <DiveGame questionSet={questionSet} />;
  } catch {
    notFound();
  }
}
