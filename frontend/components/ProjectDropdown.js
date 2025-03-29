import { useState, useEffect } from "react";
import Select from "react-select";
import { GlobeAltIcon, ChevronUpDownIcon } from "@heroicons/react/24/outline";

export default function ProjectDropdown({ onSelect }) {
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState("");
  const [selectedProject, setSelectedProject] = useState(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch("/api/projects");
        if (!response.ok) throw new Error("Failed to fetch projects");
        const data = await response.json();
        const projectOptions = data.map((project) => ({
          value: project.pid,
          label: (
            <div className="flex items-center space-x-2">
              <GlobeAltIcon className="w-5 h-5 text-purple-500" />
              <span>
                <span className="font-semibold">{project.pname}</span>
                <span className="text-gray-500 ml-2">(ID: {project.pid})</span>
              </span>
            </div>
          ),
        }));
        setProjects(projectOptions);
      } catch (error) {
        setError(`⚠️ ${error.message}`);
      }
    };

    fetchProjects();
  }, []);

  const handleChange = (selectedOption) => {
    setSelectedProject(selectedOption);
    onSelect(selectedOption?.value || "");
  };

  // Custom styles for react-select
  const customStyles = {
    control: (base) => ({
      ...base,
      backgroundColor: "#1F2937",
      borderColor: "#4B5563",
      borderRadius: "0.75rem",
      padding: "0.5rem",
      boxShadow: "none",
      "&:hover": { borderColor: "#9333EA" }
    }),
    singleValue: (base) => ({
      ...base,
      color: "white",
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: "#1F2937",
      borderRadius: "0.75rem",
      border: "1px solid #4B5563",
    }),
    option: (base, { isFocused }) => ({
      ...base,
      backgroundColor: isFocused ? "#9333EA" : "transparent",
      color: isFocused ? "white" : "#E5E7EB",
      "&:active": { backgroundColor: "#6B21A8" }
    }),
    input: (base) => ({
      ...base,
      color: "white",
    }),
    placeholder: (base) => ({
      ...base,
      color: "#9CA3AF",
    }),
  };

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
          Select Project
        </h2>
        <p className="text-gray-400 text-sm">
          Choose a project to manage expenses
        </p>
      </div>

      {error && (
        <div className="flex items-center bg-red-500/20 p-3 rounded-lg border border-red-500/30">
          <span className="text-red-400 text-sm">{error}</span>
        </div>
      )}

      <Select
        options={projects}
        value={selectedProject}
        onChange={handleChange}
        styles={customStyles}
        placeholder={
          <div className="flex items-center space-x-2">
            <ChevronUpDownIcon className="w-5 h-5 text-gray-400" />
            <span className="text-gray-400">Search or select project...</span>
          </div>
        }
        isSearchable={true}
        isClearable={true}
        components={{
          DropdownIndicator: () => (
            <ChevronUpDownIcon className="w-5 h-5 text-gray-400 mr-2" />
          ),
        }}
      />
    </div>
  );
}