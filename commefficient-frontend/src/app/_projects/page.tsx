// src/app/projects/page.tsx
// import { ProjectList } from "@/features/projects/components/ProjectList";
import { ProjectList } from "../../features/projects/components/ProjectList";

export default function ProjectsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Explore Projects</h1>
      <ProjectList />
    </div>
  );
}