import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import ProjectTable from "./expense/projectTable";

export default function ProjectDetails() {
  const router = useRouter();
  const { status } = router.query; // Get status from URL
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    if (!status) return;

    fetch(`/api/${status}`) // Fetch data from API
      .then((res) => res.json())
      .then((data) => setProjects(data))
      .catch((err) => console.error("Error fetching projects:", err));
  }, [status]);

  return (
    <div>
      <ProjectTable projects={projects} showStatus={false} />
    </div>
  );
}
