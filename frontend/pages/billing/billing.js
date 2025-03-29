'use client';
import { useState, useEffect, useRef } from 'react';
import BillHeading from '../../components/BillHeading';
import ProjectDropdown from '../../components/ProjectDropdown';
import ExpenseDetails from '../../components/ExpenseDetails';
import generatePDF from '../../components/pdfGenerator';
import StarryBackground from '@/components/StarryBackground';
import BackButton from '@/components/BackButton';
import ScrollToTopButton from '@/components/scrollup';
import { AnimatePresence, motion } from 'framer-motion';

export default function Home() {
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [expenseData, setExpenseData] = useState(null);
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

  return (
    <div className="relative min-h-screen overflow-hidden">
      <BackButton route='/dashboard' />
      <ScrollToTopButton/>
      
      <StarryBackground />
      
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-4xl mb-28 space-y-8 backdrop-blur-lg bg-black/30 rounded-2xl border border-white/10 shadow-2xl p-8 transition-all duration-300">
          <div className="space-y-6">
            <BillHeading />
            
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-transparent bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text flex items-center justify-center gap-2">
                <svg
                  className="w-6 h-6 text-purple-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 3v4a1 1 0 001 1h4m0 10v1a2 2 0 01-2 2H6a2 2 0 01-2-2v-1m16-5H4m12-4H4m4-8H4m12 4H8M4 3h10a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4a1 1 0 011-1z" />
                </svg>
                Invoice Generation System
              </h2>
            </div>

            <div className="space-y-6">
              <ProjectDropdown onSelect={setSelectedProjectId} />
              
              {selectedProjectId && (
                <div ref={expenseDetailsRef}>
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
                  className="mt-4 flex justify-center group"
                >
                  <button
                    onClick={() => generatePDF(expenseData)}
                    className="relative overflow-hidden h-12 w-40 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 transition-all duration-300"
                  >
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-white text-sm transition-all duration-300 group-hover:-translate-y-4 group-hover:opacity-0">
                        Download PDF
                      </span>
                      <svg
                        className="absolute inset-0 m-auto w-5 h-5 text-white transition-all duration-300 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0"
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
        .button {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background-color: rgb(20, 20, 20);
          border: none;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0px 0px 20px rgba(0, 0, 0, 0.164);
          cursor: pointer;
          transition-duration: .3s;
          overflow: hidden;
          position: relative;
        }

        .svgIcon {
          width: 12px;
          transition-duration: .3s;
        }

        .svgIcon path {
          fill: white;
        }

        .button:hover {
          width: 140px;
          border-radius: 50px;
          transition-duration: .3s;
          background-color: rgb(255, 69, 69);
          align-items: center;
        }

        .button:hover .svgIcon {
          width: 50px;
          transition-duration: .3s;
          transform: translateY(60%);
        }

        .button::before {
          position: absolute;
          top: -20px;
          content: "Delete";
          color: white;
          transition-duration: .3s;
          font-size: 2px;
        }

        .button:hover::before {
          font-size: 13px;
          opacity: 1;
          transform: translateY(30px);
          transition-duration: .3s;
        }
      `}</style>
    </div>
  );
}