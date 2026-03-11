import { db } from "@/db/db";
import type { Route } from "../types";

type UseHomeLessonNavigationArgs = {
  onNavigate?: (route: Route) => void;
};

export function useHomeLessonNavigation({ onNavigate }: UseHomeLessonNavigationArgs) {
  function navigateTo(target: Route) {
    onNavigate?.(target);
    window.location.hash = `#${target}`;
    window.dispatchEvent(new CustomEvent("appNavigate", { detail: target }));
  }

  async function handleLessonClick(lesson: number, requiresExam: boolean) {
    const total = await db.vocab.where("lesson").equals(lesson).count();
    const learned = await db.vocab
      .where("lesson")
      .equals(lesson)
      .and((v) => v.viewed === true)
      .count();

    if (learned < total) {
      localStorage.setItem("selectedLessonForLearn", String(lesson));
      navigateTo("learn");
      return;
    }

    const target: Route = requiresExam ? "exam" : "test";
    if (!requiresExam) {
      localStorage.setItem("selectedLessonForTest", String(lesson));
    }
    navigateTo(target);
  }

  return { handleLessonClick };
}

