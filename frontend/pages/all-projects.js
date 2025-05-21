import { useEffect, useState } from "react";
import AllProjects from "../pages/expense/allProjects";

export default function AllProjectsPage() {
  // We don't need to fetch projects here anymore since the AllProjects component handles it
  return <AllProjects />;
}