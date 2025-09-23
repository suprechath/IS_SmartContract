// src/features/admin/components/StatCard.tsx
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  title: string;
  value: string | number;
  footer?: React.ReactNode;
  iconBgColor?: string;
  iconColor?: string;
}

export const StatCard = ({
  icon: Icon,
  title,
  value,
  footer,
  iconBgColor = "bg-gray-100",
  iconColor = "text-gray-600",
}: StatCardProps) => {

  return (
    <Card>
      <CardContent className="px-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm font-medium">{title}</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">
              {value}
            </h3>
          </div>
          <div className={`${iconBgColor} p-3 rounded-lg`}>
            <Icon className={`h-6 w-6 ${iconColor}`} />
          </div>
        </div>
        {footer && <div className="mt-4">{footer}</div>}
      </CardContent>
    </Card>
  );
};