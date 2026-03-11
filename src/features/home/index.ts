export type { HomeProps, Route } from "./types";

export {
  getInitialDailyLimit,
  parseDailyLimit,
  getDailyGoalProgress,
  getDailyGoalText,
  getStreakFooterText,
  getLessonStatus,
} from "./metrics";

export { DashboardStatsGrid } from "./components/DashboardStatsGrid";
export { StreakDialog } from "./components/StreakDialog";
export { LessonProgressSection } from "./components/LessonProgressSection";
export { NumbersQuickAccessCard } from "./components/NumbersQuickAccessCard";
export { QuickActionsSection } from "./components/QuickActionsSection";
export { MotivationCard } from "./components/MotivationCard";

export { useHomeDashboardData } from "./hooks/useHomeDashboardData";
export { useHomeLessonNavigation } from "./hooks/useHomeLessonNavigation";

