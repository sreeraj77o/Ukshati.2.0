import { useEffect, useState } from "react";
import ProjectTable from "@/pages/expense/projectTable";

const AllProjects = () => {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    fetch("/api/projects")
      .then((res) => res.json())
      .then((data) => setProjects(data))
      .catch((err) => console.error("Error fetching projects:", err));
  }, []);

  return (
    <div>
      <h1>All Projects</h1>
      <ProjectTable projects={projects} />
    </div>
  );
};

export default AllProjects;
