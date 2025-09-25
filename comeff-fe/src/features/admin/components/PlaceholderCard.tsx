// src/features/admin/components/PlaceholderCard.tsx
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface PlaceholderCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export const PlaceholderCard = ({ icon: Icon, title, description }: PlaceholderCardProps) => {
  return (
    <Card>
      <CardContent className="py-12 flex flex-col items-center justify-center text-center">
        <div className="p-4 bg-muted rounded-full mb-4">
            <Icon className="h-16 w-16 text-emerald-950" />
        </div>
        <h3 className="text-xl font-semibold text-emerald-900 mb-2">{title}</h3>
        <p className="text-emerald-700 max-w-md">{description}</p>
      </CardContent>
    </Card>
  );
};