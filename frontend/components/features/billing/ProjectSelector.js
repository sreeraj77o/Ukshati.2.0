import { useState, useEffect } from "react";
import { Select, LoadingSpinner } from "../../ui";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Reusable ProjectSelector component for selecting projects in billing
 * @param {Object} props - Component props
 * @param {Function} props.onSelect - Project selection handler
 * @param {string} props.selectedProjectId - Currently selected project ID
 * @param {boolean} props.loading - Loading state
 * @param {string} props.className - Additional CSS classes
 */
const ProjectSelector = ({
  onSelect,
  selectedProjectId = "",
  loading = false,
  className = ""
}) => {
  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoadingProjects(true);
      setError("");
      
      const response = await fetch("/api/projects");
      if (!response.ok) {
        throw new Error("Failed to fetch projects");
      }
      
      const data = await response.json();
      setProjects(data);
    } catch (err) {
      setError("Failed to load projects. Please try again.");
      console.error("Error fetching projects:", err);
    } finally {
      setLoadingProjects(false);
    }
  };

  const projectOptions = projects.map(project => ({
    value: project.pid,
    label: `${project.pname} - ${project.cname}`
  }));

  const handleProjectChange = (e) => {
    const projectId = e.target.value;
    onSelect(projectId);
  };

  if (loadingProjects) {
    return (
      <div className={`text-center space-y-4 ${className}`}>
        <div className="flex items-center justify-center space-x-2">
          <LoadingSpinner size="md" />
          <span className="text-gray-400">Loading projects...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-center space-y-4 ${className}`}>
        <div className="p-4 bg-red-600/20 border border-red-600/30 rounded-lg">
          <p className="text-red-400">{error}</p>
          <button
            onClick={fetchProjects}
            className="mt-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={className}
      >
        <Select
          label="Select Project"
          value={selectedProjectId}
          onChange={handleProjectChange}
          options={projectOptions}
          placeholder="Choose a project to generate bill"
          required
          disabled={loading}
          size="lg"
        />
        
        {projects.length === 0 && (
          <p className="text-gray-500 text-sm mt-2">
            No projects found. Please create a project first.
          </p>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default ProjectSelector;
