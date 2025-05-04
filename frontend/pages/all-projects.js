import { useEffect, useState } from "react";
import AllProjects from "../pages/expense/allProjects";

export default function AllProjectsPage() {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    async function fetchProjects() {
      try {
        const response = await fetch("/api/allProjects");
        const data = await response.json();
        setProjects(data);
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    }
    fetchProjects();
  }, []);

  return <AllProjects projects={projects} />;
}