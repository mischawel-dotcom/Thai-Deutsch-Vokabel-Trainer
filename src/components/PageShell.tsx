import type { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function PageShell(props: {
  title: string;
  description?: string;
  children: ReactNode;
  /** Auf schmalen Screens weniger Padding (z. B. Lernen: alles ohne Scroll sichtbar) */
  compactNarrow?: boolean;
}) {
  const { title, description, children, compactNarrow } = props;

  return (
    <Card className="shadow-sm">
      <CardHeader className={cn("space-y-1", compactNarrow && "p-4 sm:p-6")}>
        <CardTitle className={cn("text-lg", compactNarrow && "text-base sm:text-lg")}>
          {title}
        </CardTitle>
        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}
      </CardHeader>

      <CardContent
        className={cn(
          "space-y-4",
          compactNarrow && "space-y-2 p-4 pt-0 sm:space-y-4 sm:p-6 sm:pt-0"
        )}
      >
        {children}
      </CardContent>
    </Card>
  );
}