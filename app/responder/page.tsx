import { Suspense } from "react";
import QuizResponder from "./_components/QuizResponder";

export default function Page() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <QuizResponder />
    </Suspense>
  );
}
