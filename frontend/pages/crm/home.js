"use client";
import { useState, useEffect } from "react";
import { FiUsers, FiBell, FiPackage, FiPieChart, FiSearch } from "react-icons/fi";
import { motion } from "framer-motion";
import Link from "next/link";
import dynamic from "next/dynamic";
import BackButton from "@/components/BackButton";
import Tilt from 'react-parallax-tilt';
import { CardSkeleton, TableSkeleton } from "@/components/skeleton";

const CRMDashboardVisualizations = dynamic(
  () => import("@/components/CRMdash"),
  {
    ssr: false,
    loading: () => (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="bg-white p-4 rounded-lg shadow-md h-64 flex items-center justify-center">
          <div className="animate-pulse h-48 w-full bg-gray-200 rounded"></div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md h-64 flex items-center justify-center">
          <div className="animate-pulse h-48 w-full bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }
);

const metricsData = [
  {
    id: 1,
    title: "Total Customers",
    value: "-",
    icon: <FiUsers className="text-indigo-500" />,
    trend: "+5.2%",
    color: "indigo"
  },
  {
    id: 2,
    title: "Active Projects",
    value: "-",
    icon: <FiPackage className="text-sky-500" />,
    trend: "+2.1%",
    color: "sky"
  },
  {
    id: 3,
    title: "Pending Tasks",
    value: "-",
    icon: <FiBell className="text-amber-500" />,
    trend: "-3.4%",
    color: "amber"
  },
  {
    id: 4,
    title: "Completed Projects",
    value: "-",
    icon: <FiPieChart className="text-emerald-500" />,
    trend: "+12.7%",
    color: "emerald"
  },
];

const CRMDashboard = () => {
  const [notification, setNotification] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [customers, setCustomers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [metrics, setMetrics] = useState(metricsData);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        const customersResponse = await fetch('/api/customers');
        const customersData = await customersResponse.json();

        const projectsResponse = await fetch('/api/tasks');
        const projectsData = await projectsResponse.json();

        const remindersResponse = await fetch('/api/reminders');
        const remindersData = await remindersResponse.json();

        setCustomers(customersData.customers || []);
        setProjects(Array.isArray(projectsData) ? projectsData : []);
        setReminders(Array.isArray(remindersData) ? remindersData : []);
        setFilteredCustomers(customersData.customers || []);
        updateMetrics(customersData.customers || [],
                     Array.isArray(projectsData) ? projectsData : [],
                     Array.isArray(remindersData) ? remindersData : []);

        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setNotification({
          type: "error",
          message: "Failed to load data. Please try again."
        });
        setIsLoading(false);
      }
    };

    if (isMounted) {
      fetchData();
    }
  }, [isMounted]);

  const updateMetrics = (customers, projects, reminders) => {
    const updatedMetrics = [...metrics];
    updatedMetrics[0].value = customers.length;
    const activeProjects = projects.filter(project => project.status === "Ongoing");
    updatedMetrics[1].value = activeProjects.length;
    updatedMetrics[2].value = reminders.length;
    const completedProjects = projects.filter(project => project.status === "Completed");
    updatedMetrics[3].value = completedProjects.length;
    setMetrics(updatedMetrics);
  };

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredCustomers(customers);
    } else {
      const filtered = customers.filter(customer =>
        customer.cname.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCustomers(filtered);
    }
  }, [searchTerm, customers]);

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  const handleNavigate = (section) => {
    showNotification("info", `Navigating to ${section}...`);
  };

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          <p className="mt-4 text-indigo-500 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-gray-100">
      <div className="bg-black shadow-md border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between gap-4 sm:gap-0 py-4 sm:h-16">
            <div className="hidden sm:flex">
            <BackButton route="/dashboard" />
            </div >
            <div className="flex items-center justify-between sm:justify-start">
              <h1 className="ml-2 sm:ml-4 text-xl font-bold text-indigo-400">CRM Dashboard</h1>
            </div>
            <div className="w-full sm:w-auto">
              <div className="relative max-w-xs sm:max-w-none mx-auto sm:mx-0">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search customers..."
                  className="w-full pl-10 bg-gradient-to-br from-gray-800 to-gray-900 pr-4 py-2 text-gray-200 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {isLoading ? (
            <CardSkeleton count={4} />
          ) : (
            metrics.map((metric) => (
              <motion.div
                key={metric.id}
                className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg shadow-lg overflow-hidden border border-gray-700"
                whileHover={{ y: -5 }}
                transition={{ duration: 0.3 }}
              >
                <div className="p-5">
                  <div className="flex justify-between items-center mb-4">
                    <div className="rounded-full p-3 bg-gray-900 text-indigo-400">
                      {metric.icon}
                    </div>
                    <span className={`text-${metric.color}-400 text-sm font-medium`}>
                      {metric.trend}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-gray-400 text-sm">{metric.title}</h3>
                    <p className="text-2xl font-bold text-gray-100">{metric.value}</p>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div
            className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg shadow-lg lg:col-span-2 border border-gray-700"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="p-4 sm:p-5 border-b border-gray-700">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-indigo-300">Recent Projects</h2>
                <Link href="/crm/project" passHref>
                  <span
                    className="text-indigo-400 hover:text-indigo-300 text-sm font-medium cursor-pointer"
                    onClick={() => handleNavigate("Projects")}
                  >
                    View all
                  </span>
                </Link>
              </div>
            </div>
            <div className="p-4 sm:p-5">
              {isLoading ? (
                <TableSkeleton rows={5} columns={4} />
              ) : projects.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-800">
                      <tr>
                        <th className="px-3 sm:px-4 py-3 text-left text-xs sm:text-sm font-medium text-gray-400 uppercase tracking-wider">Project</th>
                        <th className="px-3 sm:px-4 py-3 text-left text-xs sm:text-sm font-medium text-gray-400 uppercase tracking-wider">Customer</th>
                        <th className="px-3 sm:px-4 py-3 text-left text-xs sm:text-sm font-medium text-gray-400 uppercase tracking-wider">Status</th>
                        <th className="px-3 sm:px-4 py-3 text-left text-xs sm:text-sm font-medium text-gray-400 uppercase tracking-wider">Timeline</th>
                      </tr>
                    </thead>
                    <tbody className="bg-gray-800 divide-y divide-gray-700">
                      {projects.slice(0, 5).map((project) => (
                        <tr key={project.pid} className="hover:bg-gray-700">
                          <td className="px-3 sm:px-4 py-4 whitespace-nowrap text-sm sm:text-base">
                            <div className="font-medium text-gray-100">{project.pname}</div>
                          </td>
                          <td className="px-3 sm:px-4 py-4 whitespace-nowrap text-sm sm:text-base">
                            <div className="text-gray-300">{project.cname}</div>
                          </td>
                          <td className="px-3 sm:px-4 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
                              ${project.status === 'Ongoing' ? 'bg-blue-900 text-blue-200' :
                                project.status === 'Completed' ? 'bg-green-900 text-green-200' :
                                'bg-yellow-900 text-yellow-200'}`}>
                              {project.status}
                            </span>
                          </td>
                          <td className="px-3 sm:px-4 py-4 whitespace-nowrap text-sm sm:text-base">
                            <div className="text-gray-300">
                              {new Date(project.start_date).toLocaleDateString()} -
                              {project.end_date !== "TBD" ? new Date(project.end_date).toLocaleDateString() : "TBD"}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-400">No projects found</p>
                </div>
              )}
            </div>
          </motion.div>

          <motion.div
            className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg shadow-lg border border-gray-700"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="p-4 sm:p-5 border-b border-gray-700">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-indigo-300">Upcoming Reminders</h2>
                <Link href="/crm/reminders" passHref>
                  <span
                    className="text-indigo-400 hover:text-indigo-300 text-sm font-medium cursor-pointer"
                    onClick={() => handleNavigate("Reminders")}
                  >
                    View all
                  </span>
                </Link>
              </div>
            </div>
            <div className="p-4 sm:p-5">
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(4)].map((_, index) => (
                    <div key={index} className="flex items-start space-x-3 animate-pulse">
                      <div className="flex-shrink-0">
                        <div className="rounded-full p-2 bg-gray-700 h-9 w-9"></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="h-4 bg-gray-700 rounded w-1/3 mb-2"></div>
                        <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-700 rounded w-1/4"></div>
                      </div>
                      <div className="flex-shrink-0">
                        <div className="h-5 w-16 bg-gray-700 rounded-full"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : reminders.length > 0 ? (
                <div className="space-y-4">
                  {reminders.slice(0, 4).map((reminder, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <div className="rounded-full p-2 bg-indigo-900">
                          <FiBell className="h-5 w-5 text-indigo-300" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-100 truncate">
                          {reminder.title || "Follow-up"}
                        </p>
                        <p className="text-sm text-gray-400">
                          {reminder.description || "Reminder details"}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {reminder.due_date ? new Date(reminder.due_date).toLocaleDateString() : "No date set"}
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
                          ${reminder.priority === 'High' ? 'bg-red-900 text-red-200' :
                            reminder.priority === 'Medium' ? 'bg-yellow-900 text-yellow-200' :
                            'bg-blue-900 text-blue-200'}`}>
                          {reminder.priority || "Normal"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-400">No reminders found</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          <motion.div
            className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg shadow-lg border border-gray-700"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="p-4 sm:p-5 border-b border-gray-700">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-indigo-300">Recent Customers</h2>
                <Link href="/crm/customers" passHref>
                  <span
                    className="text-indigo-400 hover:text-indigo-300 text-sm font-medium cursor-pointer"
                    onClick={() => handleNavigate("Customers")}
                  >
                    View all
                  </span>
                </Link>
              </div>
            </div>
            <div className="p-4 sm:p-5">
              {isLoading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, index) => (
                    <div key={index} className="flex items-center space-x-3 p-2 sm:p-3 rounded-lg animate-pulse">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-gray-700"></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                      </div>
                      <div className="flex-shrink-0">
                        <div className="h-5 w-16 bg-gray-700 rounded-full"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredCustomers.length > 0 ? (
                <div className="space-y-3">
                  {filteredCustomers.slice(0, 5).map((customer) => (
                    <div key={customer.cid} className="flex items-center space-x-3 p-2 sm:p-3 hover:bg-gray-700 rounded-lg">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-indigo-900 flex items-center justify-center">
                          <span className="text-indigo-300 font-medium">
                            {customer.cname.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-100 truncate">
                          {customer.cname}
                        </p>
                        <p className="text-sm text-gray-400">
                          {customer.cphone}
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
                          ${customer.status === 'customer' ? 'bg-green-900 text-green-200' :
                            customer.status === 'lead' ? 'bg-yellow-900 text-yellow-200' :
                            'bg-blue-900 text-blue-200'}`}>
                          {customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-400">No customers found</p>
                </div>
              )}
            </div>
          </motion.div>

          <motion.div
            className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Link href="/crm/customers" passHref>
              <Tilt
                className="h-full"
                tiltMaxAngleX={10}
                tiltMaxAngleY={10}
                perspective={1000}
                scale={1.03}
                transitionSpeed={1500}
                glareEnable={true}
                glareMaxOpacity={0.2}
                glareColor="#6366F1"
              >
                <motion.div
                  className="bg-gradient-to-br from-indigo-900 to-indigo-800 rounded-lg shadow-lg overflow-hidden cursor-pointer h-full border border-indigo-700"
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="p-4 sm:p-5 flex flex-col h-full">
                    <div className="rounded-full bg-black/30 p-3 self-start mb-4">
                      <FiUsers className="h-6 w-6 text-indigo-300" />
                    </div>
                    <h3 className="text-xl font-semibold text-indigo-200 mb-2">Customers</h3>
                    <p className="text-indigo-300/80 text-sm mb-4">Manage client relationships and interactions</p>
                    <div className="mt-auto flex items-center text-indigo-200 text-sm font-medium">
                      <span>View details</span>
                      <svg className="ml-2 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </motion.div>
              </Tilt>
            </Link>

            <Link href="/crm/reminders" passHref>
              <Tilt
                className="h-full"
                tiltMaxAngleX={10}
                tiltMaxAngleY={10}
                perspective={1000}
                scale={1.03}
                transitionSpeed={1500}
                glareEnable={true}
                glareMaxOpacity={0.2}
                glareColor="#0EA5E9"
              >
                <motion.div
                  className="bg-gradient-to-br from-sky-900 to-sky-800 rounded-lg shadow-lg overflow-hidden cursor-pointer h-full border border-sky-700"
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="p-4 sm:p-5 flex flex-col h-full">
                    <div className="rounded-full bg-black/30 p-3 self-start mb-4">
                      <FiBell className="h-6 w-6 text-sky-300" />
                    </div>
                    <h3 className="text-xl font-semibold text-sky-200 mb-2">Reminders</h3>
                    <p className="text-sky-300/80 text-sm mb-4">Track important tasks and deadlines</p>
                    <div className="mt-auto flex items-center text-sky-200 text-sm font-medium">
                      <span>View details</span>
                      <svg className="ml-2 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </motion.div>
              </Tilt>
            </Link>

            <Link href="/crm/project" passHref>
              <Tilt
                className="h-full"
                tiltMaxAngleX={10}
                tiltMaxAngleY={10}
                perspective={1000}
                scale={1.03}
                transitionSpeed={1500}
                glareEnable={true}
                glareMaxOpacity={0.2}
                glareColor="#A855F7"
              >
                <motion.div
                  className="bg-gradient-to-br from-purple-900 to-purple-800 rounded-lg shadow-lg overflow-hidden cursor-pointer h-full border border-purple-700"
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="p-4 sm:p-5 flex flex-col h-full">
                    <div className="rounded-full bg-black/30 p-3 self-start mb-4">
                      <FiPackage className="h-6 w-6 text-purple-300" />
                    </div>
                    <h3 className="text-xl font-semibold text-purple-200 mb-2">Projects</h3>
                    <p className="text-purple-300/80 text-sm mb-4">Monitor ongoing and upcoming initiatives</p>
                    <div className="mt-auto flex items-center text-purple-200 text-sm font-medium">
                      <span>View details</span>
                      <svg className="ml-2 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </motion.div>
              </Tilt>
            </Link>
          </motion.div>
        </div>
      </div>

      {notification && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 px-4 py-3 rounded-lg shadow-lg max-w-xs z-50
            ${notification.type === 'error' ? 'bg-red-900 text-red-100' :
              notification.type === 'success' ? 'bg-green-900 text-green-100' :
              'bg-indigo-900 text-indigo-100'}`}
        >
          <div className="flex items-center">
            {notification.type === 'error' ? (
              <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : notification.type === 'success' ? (
              <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            <span>{notification.message}</span>
          </div>
        </motion.div>
      )}

      <CRMDashboardVisualizations />
    </div>
  );
};

export default CRMDashboard;