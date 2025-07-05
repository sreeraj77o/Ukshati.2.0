import { useRouter } from "next/router";
import { ProjectCard } from "../ui";
import { FaCheck } from "react-icons/fa";

/**
 * Projects tab content component
 * @param {Object} props - Component props
 * @param {Object} props.dashboardData - Dashboard data
 */
const ProjectsTab = ({ dashboardData }) => {
  const router = useRouter();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-black rounded-xl p-6 shadow-lg border border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Active Projects</h2>
          <button 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors text-sm" 
            onClick={() => router.push('/crm/home')}
          >
            New Project
          </button>
        </div>
        <div>
          {(dashboardData.tasks || []).slice(0, 4).map((task, index) => (
            <ProjectCard
              key={index}
              id={task.id?.slice(-4).toUpperCase()}
              customer={task.pname || 'Unknown Customer'}
              status={task.status || 'Pending'}
              progress={task.progress || 0}
            />
          ))}
        </div>
      </div>
      
      <div className="bg-black rounded-xl p-6 shadow-lg border border-gray-700">
        <h2 className="text-xl font-bold text-white mb-6">Project Stats</h2>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-300">Completed</span>
              <span className="text-sm font-medium text-white">{dashboardData.stats.completedTasks}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div className="h-2 rounded-full bg-green-500" style={{ width: `${dashboardData.stats.completedTasks}%` }}></div>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-300">In Progress</span>
              <span className="text-sm font-medium text-white">{dashboardData.stats.inProgressTasks}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div className="h-2 rounded-full bg-blue-500" style={{ width: `${dashboardData.stats.inProgressTasks}%` }}></div>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-300">Pending</span>
              <span className="text-sm font-medium text-white">{dashboardData.stats.pendingTasks}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div className="h-2 rounded-full bg-yellow-500" style={{ width: `${dashboardData.stats.pendingTasks}%` }}></div>
            </div>
          </div>
        </div>
        <div className="mt-8">
          <h3 className="text-lg font-medium text-white mb-3">Recent Updates</h3>
          <div className="space-y-3">
            {dashboardData.tasks.slice(0, 3).map((task, index) => (
              <div key={index} className="flex items-start">
                <div className="p-1.5 bg-blue-600/20 rounded-full mr-3 mt-1">
                  <FaCheck className="text-blue-400 text-xs" />
                </div>
                <div>
                  <p className="text-sm text-white">Project {task.id?.slice(-4).toUpperCase()} updated</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(task.start_date).toLocaleDateString()} -- {task.pname || 'System'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectsTab;
