export type Route = "home" | "list" | "learn" | "test" | "exam" | "games" | "settings";

export interface HomeProps {
  onNavigate?: (route: Route) => void;
}

