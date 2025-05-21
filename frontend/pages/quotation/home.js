"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { FaPlus, FaEye, FaMoneyBillWave, FaInfoCircle, FaTimes } from "react-icons/fa";
import { motion } from "framer-motion";
import Tilt from "react-parallax-tilt";
import BackButton from "@/components/BackButton";
import ScrollToTopButton from "@/components/scrollup";
import { CardSkeleton } from "@/components/skeleton";


export default function Home() {
  const router = useRouter();
  const [flipped, setFlipped] = useState(Array(3).fill(false));
  const [loading, setLoading] = useState(true);

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Handle card flip
  const handleFlip = (index) => {
    setFlipped(prev => {
      const newFlipped = [...prev];
      newFlipped[index] = !newFlipped[index];
      return newFlipped;
    });
  };

  const quotationCards = [
    {
      id: 1,
      title: "Generate Quotes",
      Icon: FaPlus,
      description: "Create new quotations for clients",
      gradient: "bg-gradient-to-r from-blue-400/30 to-indigo-500/40",
      route: "/quotation/QuoteManager",
      stats: {
        main: "New",
        secondary: "Quote"
      },
      filedBy: "Sales Team"
    },
    {
      id: 2,
      title: "View Quotes",
      Icon: FaEye,
      description: "Browse and manage existing quotes",
      gradient: "bg-gradient-to-r from-green-400/30 to-emerald-400/40",
      route: "/quotation/QuoteList",
      stats: {
        main: "12",
        secondary: "Active"
      },
      filedBy: "Sales Team"
    },
    {
      id: 3,
      title: "Manage Rates",
      Icon: FaMoneyBillWave,
      description: "Configure and update product pricing rates",
      gradient: "bg-gradient-to-r from-purple-400/30 to-violet-500/40",
      route: "/quotation/RatesManagement",
      stats: {
        main: "24",
        secondary: "Items"
      },
      filedBy: "Sales Team"
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      <div className="absolute top-4 left-4 z-10">
        <BackButton route="/dashboard" />
      </div>
      <ScrollToTopButton />

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center flex-grow p-6 py-20">
        <h1 className="text-4xl font-bold mb-16 mt-8 text-center">Quote Management System</h1>

        {/* Dashboard-Style Cards */}
        <div className="w-full max-w-7xl px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {loading ? (
              <CardSkeleton count={3} />
            ) : (
              quotationCards.map((card, index) => (
                <Tilt key={index} tiltMaxAngleX={5} tiltMaxAngleY={5} glareEnable={true} glareMaxOpacity={0.1}>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`relative h-64 rounded-xl overflow-hidden shadow-lg cursor-pointer ${card.gradient}`}
                    onClick={() => router.push(card.route)}
                  >
                    <div className="absolute inset-0 p-6 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between">
                          <div className="p-3 rounded-lg bg-white/10 backdrop-blur-sm">
                            <card.Icon size={24} className="text-white" />
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleFlip(index);
                            }}
                            className="p-2 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors"
                          >
                            {flipped[index] ? <FaTimes /> : <FaInfoCircle />}
                          </button>
                        </div>
                        <h3 className="mt-4 text-xl font-bold text-white">{card.title}</h3>
                        <p className="mt-1 text-gray-200">{card.description}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-2xl font-bold text-white">{card.stats.main}</p>
                          <p className="text-xs text-gray-200">{card.stats.secondary}</p>
                        </div>
                        <div className="text-xs text-gray-200">
                          {card.filedBy}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </Tilt>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full bg-black border-t border-gray-800 text-white py-4 text-center mt-auto">
        <p className="text-sm">© {new Date().getFullYear()} Quote Management System</p>
      </footer>
    </div>
  );
}