// src/features/admin/components/AdminTabs.tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FolderCheck, Users, Coins, Target, PieChart } from "lucide-react";
import { ProjectVettingTable } from "./ProjectVettingTable";
import { UserManagementTable } from "./UserManagementTable";
import { PlaceholderCard } from "./PlaceholderCard";
import type { Project, User } from "../types";

interface AdminTabsProps {
    projects: Project[];
    users: User[];
}

export const AdminTabs = ({ projects, users }: AdminTabsProps) => {
    return (
        <Tabs defaultValue="projects" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 h-16 p-2 bg-emerald-700/10 text-emerald-700/50 rounded-lg">
                <TabsTrigger value="projects">
                    <FolderCheck className="h-8 w-8 mr-2" />
                    Projects
                </TabsTrigger>
                <TabsTrigger value="users">
                    <Users className="h-8 w-8 mr-2" />
                    Users
                </TabsTrigger>
                <TabsTrigger value="factoryContracts">
                    <Target className="h-8 w-8 mr-2" />
                    Factory contracts
                </TabsTrigger>
            </TabsList>

            <TabsContent value="projects">
                <ProjectVettingTable projects={projects} />
            </TabsContent>
            <TabsContent value="users">
                <UserManagementTable users={users} />
            </TabsContent>
            <TabsContent value="factoryContracts">
                <PlaceholderCard
                    icon={Target}
                    title="Factory contracts Management"
                    description="Manage and monitor factory contracts. (Feature coming soon)."
                />
            </TabsContent>
        </Tabs>
    );
};