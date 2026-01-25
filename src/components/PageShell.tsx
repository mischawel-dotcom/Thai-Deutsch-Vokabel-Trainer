import type { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PageShell(props: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  const { title, description, children } = props;

  return (
    <Card className="shadow-sm">
      <CardHeader className="space-y-1">
        <CardTitle className="text-lg">{title}</CardTitle>
        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}
      </CardHeader>

      <CardContent className="space-y-4">{children}</CardContent>
    </Card>
  );
}