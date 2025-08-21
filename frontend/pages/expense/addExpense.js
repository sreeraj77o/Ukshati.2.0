import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  FiArrowUp,
  FiCalendar,
  FiUser,
  FiDollarSign,
  FiFileText,
  FiCheckCircle,
} from 'react-icons/fi';
import BackButton from '@/components/BackButton';
import ScrollToTopButton from '@/components/scrollup';
import { FormSkeleton } from '@/components/skeleton';

export default function AddExpense() {
  const router = useRouter();
  const [date, setDate] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [projectStatus, setProjectStatus] = useState('');
  const [projectId, setProjectId] = useState('');
  const [amount, setAmount] = useState('');
  const [comments, setComments] = useState('');
  const [projects, setProjects] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (user.id) {
          setEmployeeId(user.id); // Autofill employeeId from logged-in user

          // Simulate data loading delay (remove in production if not needed)
          await new Promise(resolve => setTimeout(resolve, 300));

          setLoading(false);
        } else {
          setMessage('User not logged in. Please log in first.');
          router.push('/expense/login'); // Redirect to login if no user found
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        router.push('/expense/login');
      }
    };

    loadUserData();
  }, [router]);

  useEffect(() => {
    if (projectStatus) {
      fetch(`/api/projects?status=${projectStatus}`)
        .then(res => {
          if (!res.ok) throw new Error('Network response was not ok');
          return res.json();
        })
        .then(data => {
          // Ensure only projects matching the selected status are displayed
          const filteredProjects = data.filter(
            project => project.status === projectStatus
          );
          setProjects(filteredProjects);
        })
        .catch(err => {
          console.error('Error fetching projects:', err);
          setProjects([]);
        });
    } else {
      setProjects([]);
    }
  }, [projectStatus]);

  const handleSubmit = async e => {
    e.preventDefault();
    const response = await fetch('/api/addExpense', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date, employeeId, projectId, amount, comments }),
    });
    const data = await response.json();
    if (response.status === 201) {
      setMessage(`Expense added successfully with ID: ${data.expenseId}`);
      // Reset form fields
      setDate('');
      setProjectStatus('');
      setProjectId('');
      setAmount('');
      setComments('');
      setProjects([]);
    } else {
      setMessage(data.message || 'Failed to add expense');
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-black">
      <BackButton route="/expense/home" Icon={FiArrowUp} />
      <ScrollToTopButton />

      <div className="min-h-screen flex items-center justify-center px-4 md:px-8 py-12">
        {/* Glass Card Container */}
        <div className="w-full max-w-2xl bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl shadow-blue-900/20 transition-all duration-300 hover:shadow-blue-900/30">
          <div className="p-8 md:p-12 space-y-8">
            {/* Header Section */}
            <div className="text-center space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Add New Expense
              </h1>
              <p className="text-gray-300 text-lg">
                Track your project expenditures seamlessly
              </p>
            </div>

            {/* Form Section */}
            {loading ? (
              <FormSkeleton fields={6} />
            ) : (
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Date Input */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-blue-300 font-medium">
                      <FiCalendar className="text-lg" />
                      Date
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        value={date}
                        onChange={e => setDate(e.target.value)}
                        required
                        className="w-full p-4 rounded-xl bg-white/5 border border-white/10 focus:border-blue-400/50 focus:ring-2 focus:ring-blue-400/20 backdrop-blur-sm text-white transition-all"
                      />
                    </div>
                  </div>

                  {/* Employee ID */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-blue-300 font-medium">
                      <FiUser className="text-lg" />
                      Employee ID
                    </label>
                    <input
                      type="number"
                      value={employeeId}
                      readOnly
                      className="w-full p-4 rounded-xl bg-white/5 border border-white/10 cursor-not-allowed opacity-80 text-gray-300"
                    />
                  </div>

                  {/* Project Status */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-blue-300 font-medium">
                      <FiCheckCircle className="text-lg" />
                      Project Status
                    </label>
                    <select
                      value={projectStatus}
                      onChange={e => setProjectStatus(e.target.value)}
                      required
                      className="w-full p-4 rounded-xl bg-white/5 border border-white/10 focus:border-blue-400/50 focus:ring-2 focus:ring-blue-400/20 backdrop-blur-sm text-white appearance-none"
                    >
                      <option value="" className="bg-gray-800">
                        Select Status
                      </option>
                      <option value="Ongoing" className="bg-gray-800">
                        Ongoing
                      </option>
                      <option value="On Hold" className="bg-gray-800">
                        On Hold
                      </option>
                    </select>
                  </div>

                  {/* Project Select */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-blue-300 font-medium">
                      <FiCheckCircle className="text-lg" />
                      Select Project
                    </label>
                    <select
                      value={projectId}
                      onChange={e => setProjectId(e.target.value)}
                      required
                      disabled={!projectStatus}
                      className="w-full p-4 rounded-xl bg-white/5 border border-white/10 focus:border-blue-400/50 focus:ring-2 focus:ring-blue-400/20 backdrop-blur-sm text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="" className="bg-gray-800">
                        Select Project
                      </option>
                      {projects.map(project => (
                        <option
                          key={project.pid}
                          value={project.pid}
                          className="bg-gray-800"
                        >
                          {project.pname} (ID: {project.pid})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Amount Input */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-blue-300 font-medium">
                      <FiDollarSign className="text-lg" />
                      Amount
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={amount}
                      onChange={e => setAmount(e.target.value)}
                      required
                      className="w-full p-4 rounded-xl bg-white/5 border border-white/10 focus:border-blue-400/50 focus:ring-2 focus:ring-blue-400/20 backdrop-blur-sm text-white"
                    />
                  </div>
                </div>

                {/* Comments Textarea */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-blue-300 font-medium">
                    <FiFileText className="text-lg" />
                    Comments
                  </label>
                  <textarea
                    value={comments}
                    onChange={e => setComments(e.target.value)}
                    className="w-full p-4 rounded-xl bg-white/5 border border-white/10 focus:border-blue-400/50 focus:ring-2 focus:ring-blue-400/20 backdrop-blur-sm text-white min-h-[120px]"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full py-4 px-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl font-semibold text-white hover:from-blue-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-[1.02] active:scale-95 shadow-lg hover:shadow-blue-500/30 flex items-center justify-center gap-2"
                >
                  Add Expense
                </button>
              </form>
            )}

            {/* Status Message */}
            {message && (
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center animate-fade-in">
                <p className="text-sm font-medium text-blue-400">{message}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Embedded CSS */}
      <style jsx global>{`
        /* Custom animations */
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }

        /* Custom select arrow */
        select {
          background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23fff'%3e%3cpath d='M7 10l5 5 5-5z'/%3e%3c/svg%3e");
          background-repeat: no-repeat;
          background-position: right 1rem center;
          background-size: 1.5em;
        }

        /* Remove number input arrows */
        input::-webkit-outer-spin-button,
        input::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }

        input[type='number'] {
          -moz-appearance: textfield;
        }
      `}</style>
    </div>
  );
}
