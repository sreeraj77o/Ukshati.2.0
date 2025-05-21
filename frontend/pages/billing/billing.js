'use client';
import { useState, useEffect, useRef } from 'react';
import BillHeading from '../../components/BillHeading';
import ProjectDropdown from '../../components/ProjectDropdown';
import ExpenseDetails from '../../components/ExpenseDetails';
import generatePDF from '../../components/pdfGenerator';
import BackButton from '@/components/BackButton';
import ScrollToTopButton from '@/components/scrollup';
import { AnimatePresence, motion } from 'framer-motion';
import { FormSkeleton, CardSkeleton } from '@/components/skeleton';

export default function Home() {
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [expenseData, setExpenseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const expenseDetailsRef = useRef(null);
  const pdfButtonRef = useRef(null);

  // Scroll to expense details when project is selected
  useEffect(() => {
    if (selectedProjectId && expenseDetailsRef.current) {
      expenseDetailsRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  }, [selectedProjectId]);

  // Scroll to PDF button when data is loaded
  useEffect(() => {
    if (expenseData && pdfButtonRef.current) {
      pdfButtonRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'end'
      });
    }
  }, [expenseData]);

  // Handle loading state
  useEffect(() => {
    // Simulate initial loading
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      <BackButton route='/dashboard' />
      <ScrollToTopButton/>
      <div className="relative z-10 flex items-center justify-center min-h-screen p-2 sm:p-4 md:p-6">
        <div className="w-full max-w-4xl mb-16 sm:mb-20 md:mb-28 space-y-6 md:space-y-8 backdrop-blur-lg bg-black/30 rounded-xl sm:rounded-2xl border border-gray-600 shadow-lg sm:shadow-2xl p-4 sm:p-6 md:p-8 transition-all duration-300">
          <div className="space-y-4 md:space-y-6">
            <BillHeading />

            <div className="space-y-1 md:space-y-2">
              <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-transparent bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text flex items-center justify-center gap-2">
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 3v4a1 1 0 001 1h4m0 10v1a2 2 0 01-2 2H6a2 2 0 01-2-2v-1m16-5H4m12-4H4m4-8H4m12 4H8M4 3h10a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4a1 1 0 011-1z" />
                </svg>
                Invoice Generation System
              </h2>
            </div>

            <div className="space-y-4 md:space-y-6">
              {loading ? (
                <div className="space-y-4 max-w-2xl mx-auto">
                  <div className="text-center space-y-1">
                    <div className="h-8 bg-gray-700 rounded-lg w-48 mx-auto animate-pulse"></div>
                    <div className="h-4 bg-gray-700 rounded-lg w-64 mx-auto animate-pulse"></div>
                  </div>
                  <div className="h-12 bg-gray-700 rounded-lg w-full animate-pulse"></div>
                </div>
              ) : (
                <ProjectDropdown onSelect={setSelectedProjectId} />
              )}

              {selectedProjectId && (
                <div ref={expenseDetailsRef} className="mt-2 sm:mt-4">
                  <ExpenseDetails
                    projectId={selectedProjectId}
                    setExpenseData={setExpenseData}
                  />
                </div>
              )}
            </div>

            <AnimatePresence>
              {expenseData && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="mt-2 sm:mt-4 flex justify-center group"
                  ref={pdfButtonRef}
                >
                  <button
                    onClick={() => generatePDF(expenseData)}
                    className="relative overflow-hidden h-10 sm:h-12 w-32 sm:w-40 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 transition-all duration-300"
                  >
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-white text-xs sm:text-sm transition-all duration-300 group-hover:-translate-y-4 group-hover:opacity-0">
                        Download PDF
                      </span>
                      <svg
                        className="absolute inset-0 m-auto w-4 h-4 sm:w-5 sm:h-5 text-white transition-all duration-300 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                        />
                      </svg>
                    </div>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <style jsx global>{`
        /* Responsive button styles */
        .button {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background-color: rgb(20, 20, 20);
          border: none;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.164);
          cursor: pointer;
          transition-duration: 0.3s;
          overflow: hidden;
          position: relative;
        }

        @media (min-width: 640px) {
          .button {
            width: 50px;
            height: 50px;
            box-shadow: 0px 0px 20px rgba(0, 0, 0, 0.164);
          }
        }

        .svgIcon {
          width: 10px;
          transition-duration: 0.3s;
        }

        @media (min-width: 640px) {
          .svgIcon {
            width: 12px;
          }
        }

        .svgIcon path {
          fill: white;
        }

        .button:hover {
          width: 110px;
          border-radius: 50px;
          transition-duration: 0.3s;
          background-color: rgb(255, 69, 69);
          align-items: center;
        }

        @media (min-width: 640px) {
          .button:hover {
            width: 140px;
          }
        }

        .button:hover .svgIcon {
          width: 40px;
          transition-duration: 0.3s;
          transform: translateY(60%);
        }

        @media (min-width: 640px) {
          .button:hover .svgIcon {
            width: 50px;
          }
        }

        .button::before {
          position: absolute;
          top: -15px;
          content: "Delete";
          color: white;
          transition-duration: 0.3s;
          font-size: 2px;
        }

        @media (min-width: 640px) {
          .button::before {
            top: -20px;
          }
        }

        .button:hover::before {
          font-size: 11px;
          opacity: 1;
          transform: translateY(25px);
          transition-duration: 0.3s;
        }

        @media (min-width: 640px) {
          .button:hover::before {
            font-size: 13px;
            transform: translateY(30px);
          }
        }
      `}</style>
    </div>
  );
}