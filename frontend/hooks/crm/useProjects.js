import { useState, useEffect, useCallback } from 'react';
import useApi from '../shared/useApi';

/**
 * Hook for managing projects data and operations
 * @returns {Object} Projects data and operations
 */
const useProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const { get, post, put, delete: del, error } = useApi();

  // Fetch all projects
  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      const data = await get('/projects');
      setProjects(data);
    } catch (err) {
      console.error('Error fetching projects:', err);
    } finally {
      setLoading(false);
    }
  }, [get]);

  // Add new project
  const addProject = useCallback(async (projectData) => {
    try {
      const newProject = await post('/projects', projectData);
      setProjects(prev => [...prev, newProject]);
      return newProject;
    } catch (err) {
      console.error('Error adding project:', err);
      throw err;
    }
  }, [post]);

  // Update project
  const updateProject = useCallback(async (projectId, projectData) => {
    try {
      const updatedProject = await put(`/projects/${projectId}`, projectData);
      setProjects(prev => 
        prev.map(project => 
          project.pid === projectId ? updatedProject : project
        )
      );
      return updatedProject;
    } catch (err) {
      console.error('Error updating project:', err);
      throw err;
    }
  }, [put]);

  // Delete project
  const deleteProject = useCallback(async (projectId) => {
    try {
      await del(`/projects/${projectId}`);
      setProjects(prev => prev.filter(project => project.pid !== projectId));
    } catch (err) {
      console.error('Error deleting project:', err);
      throw err;
    }
  }, [del]);

  // Get project by ID
  const getProjectById = useCallback((projectId) => {
    return projects.find(project => project.pid === projectId);
  }, [projects]);

  // Get projects by customer
  const getProjectsByCustomer = useCallback((customerId) => {
    return projects.filter(project => project.cid === customerId);
  }, [projects]);

  // Get projects by status
  const getProjectsByStatus = useCallback((status) => {
    return projects.filter(project => project.status === status);
  }, [projects]);

  // Search projects
  const searchProjects = useCallback((query) => {
    if (!query.trim()) return projects;
    
    const lowercaseQuery = query.toLowerCase();
    return projects.filter(project =>
      project.pname.toLowerCase().includes(lowercaseQuery) ||
      project.cname?.toLowerCase().includes(lowercaseQuery) ||
      project.status.toLowerCase().includes(lowercaseQuery)
    );
  }, [projects]);

  // Get project statistics
  const getProjectStats = useCallback(() => {
    const stats = {
      total: projects.length,
      ongoing: 0,
      completed: 0,
      onHold: 0,
      cancelled: 0,
    };

    projects.forEach(project => {
      switch (project.status.toLowerCase()) {
        case 'ongoing':
          stats.ongoing++;
          break;
        case 'completed':
          stats.completed++;
          break;
        case 'on hold':
          stats.onHold++;
          break;
        case 'cancelled':
          stats.cancelled++;
          break;
      }
    });

    return stats;
  }, [projects]);

  // Load projects on mount
  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return {
    projects,
    loading,
    error,
    fetchProjects,
    addProject,
    updateProject,
    deleteProject,
    getProjectById,
    getProjectsByCustomer,
    getProjectsByStatus,
    searchProjects,
    getProjectStats,
  };
};

export default useProjects;
