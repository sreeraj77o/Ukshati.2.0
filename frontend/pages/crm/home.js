"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { FiUsers, FiBell, FiPackage } from "react-icons/fi";
import { motion } from "framer-motion";
import BackButton from "@/components/BackButton";
import Footer from "@/components/Footer";

// Dynamically import StarryBackground with SSR disabled
const StarryBackground = dynamic(
  () => import("@/components/StarryBackground"),
  {
    ssr: false,
    loading: () => <div className="fixed inset-0 bg-gray-900 z-0" />,
  }
);

const HomePage = () => {
  const [notification, setNotification] = useState(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleButtonClick = (section) => {
    setNotification(`Navigating to ${section}...`);
  };

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <StarryBackground />
      <BackButton route="/dashboard" />

      <div className="flex flex-col items-center flex-grow pt-16 pb-20 px-4 sm:pt-20 sm:px-6 lg:px-8">
        {/* Responsive Title */}
        <h1
          className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 text-center text-white"
          style={{
            fontSize: "clamp(1.5rem, 4vw, 3rem)", // Responsive font size
          }}
        >
          Customer Relationship Management
        </h1>

        {/* Notification System */}
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-4 right-4 bg-gray-800/80 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-lg backdrop-blur-sm shadow-lg text-sm sm:text-base"
          >
            {notification}
          </motion.div>
        )}

        {/* Main Content - Responsive Grid */}
        <motion.div
          className="w-full flex justify-center items-center min-h-[50vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-12 lg:gap-16 max-w-7xl w-full px-4">
            {/* Customers Card */}
            <Link href="/crm/customers" passHref>
              <motion.a
                className="card"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleButtonClick("Customers")}
              >
                <div className="heading">
                  <FiUsers
                    className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4"
                    style={{
                      fontSize: "clamp(1.5rem, 2vw, 2.5rem)", // Responsive icon size
                    }}
                  />
                  <h2 className="text-lg sm:text-xl">Customers</h2>
                </div>
                <p className="text-sm sm:text-base">Manage client relationships and interactions</p>
                <p className="text-sm sm:text-base">Click to explore</p>
              </motion.a>
            </Link>

            {/* Reminders Card */}
            <Link href="/crm/reminders" passHref>
              <motion.a
                className="card"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleButtonClick("Reminders")}
              >
                <div className="heading">
                  <FiBell
                    className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4"
                    style={{
                      fontSize: "clamp(1.5rem, 2vw, 2.5rem)", // Responsive icon size
                    }}
                  />
                  <h2 className="text-lg sm:text-xl">Reminders</h2>
                </div>
                <p className="text-sm sm:text-base">Track important tasks and deadlines with Notification</p>
                <p className="text-sm sm:text-base">Click to explore</p>
              </motion.a>
            </Link>

            {/* Projects Card */}
            <Link href="/crm/project" passHref>
              <motion.a
                className="card"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleButtonClick("Projects")}
              >
                <div className="heading">
                  <FiPackage
                    className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4"
                    style={{
                      fontSize: "clamp(1.5rem, 2vw, 2.5rem)", // Responsive icon size
                    }}
                  />
                  <h2 className="text-lg sm:text-xl">Projects</h2>
                </div>
                <p className="text-sm sm:text-base">Monitor ongoing and upcoming initiatives</p>
                <p className="text-sm sm:text-base">Click to explore</p>
              </motion.a>
            </Link>
          </div>
        </motion.div>
      </div>

      <Footer />

      {/* Responsive Global Styles */}
      <style jsx global>{`
        body {
          background: linear-gradient(to bottom right, #0f172a, #1e293b);
          color: white;
          margin: 0;
          padding: 0;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        }

        .card {
          position: relative;
          width: 100%;
          max-width: 180px;
          height: auto; /* Adjust height automatically */
          background-color: #000;
          display: flex;
          flex-direction: column;
          justify-content: end;
          padding: 1rem;
          gap: 0.75rem;
          border-radius: 8px;
          cursor: pointer;
          margin: 0 auto;
          text-align: center;
        }

        @media (min-width: 640px) {
          .card {
            height: auto;
            padding: 1.25rem;
            gap: 0.875rem;
          }
        }

        .card::before {
          content: '';
          position: absolute;
          inset: 0;
          left: -5px;
          margin: auto;
          width: calc(100% + 10px);
          height: calc(100% + 10px);
          border-radius: 10px;
          background: linear-gradient(-45deg, #e81cff 0%, #40c9ff 100%);
          z-index: -10;
          pointer-events: none;
          transition: all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        .card::after {
          content: "";
          z-index: -1;
          position: absolute;
          inset: 0;
          background: linear-gradient(-45deg, #fc00ff 0%, #00dbde 100%);
          transform: translate3d(0, 0, 0) scale(0.95);
          filter: blur(20px);
        }

        .heading {
          font-size: clamp(1rem, 2vw, 1.5rem); /* Responsive font size */
          text-transform: capitalize;
          font-weight: 700;
        }

        .card p:not(.heading) {
          font-size: clamp(0.875rem, 1.5vw, 1rem); /* Responsive font size */
        }

        .card p:last-child {
          color: #e81cff;
          font-weight: 600;
        }

        .card:hover::after {
          filter: blur(30px);
        }

        .card:hover::before {
          transform: rotate(-90deg) scaleX(1.34) scaleY(0.77);
        }
      `}</style>
    </div>
  );
};

export default dynamic(() => Promise.resolve(HomePage), { ssr: false });