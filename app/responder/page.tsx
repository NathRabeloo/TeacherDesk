// app/responder/page.tsx
import { Suspense } from "react";
import QuizResponder from "./QuizResponder";

export default function Page() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <QuizResponder />
    </Suspense>
  );
}
