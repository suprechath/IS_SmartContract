import { Badge } from "@/components/ui/badge";

// Badge utility functions
export const getStatusBadge = (status: string) => {
    const statusConfig = {
      approved: { label: "Approved", className: "bg-blue-100 text-blue-800" },
      funding: { label: "Funding", className: "bg-yellow-100 text-yellow-800" },
      succeeded: { label: "Succeeded", className: "bg-blue-100 text-blue-800" },
      failed: { label: "Failed", className: "bg-red-100 text-red-800" },
      active: { label: "Active", className: "bg-green-100 text-green-800" },

      verified: { label: "Verified", className: "bg-green-100 text-green-800" },
      pending: { label: "Pending", className: "bg-yellow-100 text-yellow-800" },
      rejected: { label: "Rejected", className: "bg-red-100 text-red-800" },
    };

    //@ts-ignore
    const config = statusConfig[status] || { label: status, className: "bg-gray-100 text-gray-800" };
    return <Badge className={`${config.className} hover:${config.className}`}>{config.label}</Badge>;
};

export const getRoleBadge = (role: string) => {
    const roleConfig = {
      investor: { label: "Investor", className: "bg-blue-100 text-blue-800" },
      project_creator: { label: "Project Creator", className: "bg-purple-100 text-purple-800" },
      platform_operator: { label: "Admin", className: "bg-rose-100 text-rose-800" }
    };
    //@ts-ignore
    const config = roleConfig[role] || { label: role, className: "bg-gray-100 text-gray-800" };
    return <Badge className={`${config.className} hover:${config.className}`}>{config.label}</Badge>;
};

export const getTXStatusBadge = (status: string) => {
    const statusConfig = {
      Investment: { label: "Investment", className: "bg-green-100 text-green-800" },
      Withdrawal: { label: "Withdrawal", className: "bg-yellow-100 text-yellow-800" },
      RewardDeposit: { label: "RewardDeposit", className: "bg-blue-950 text-blue-100" },
      RewardClaim: { label: "RewardClaim", className: "bg-indigo-100 text-indigo-800" },
      Refund: { label: "Refund", className: "bg-red-100 text-red-800" },
    };

    //@ts-ignore
    const config = statusConfig[status] || { label: status, className: "bg-gray-100 text-gray-800" };
    return <Badge className={`${config.className} hover:${config.className}`}>{config.label}</Badge>;
};