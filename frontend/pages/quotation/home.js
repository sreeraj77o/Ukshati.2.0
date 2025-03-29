"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { FaPlus, FaEye } from "react-icons/fa";
import { motion } from "framer-motion";
import StarryBackground from "@/components/StarryBackground";
import BackButton from "@/components/BackButton";
import Image from "next/image";

export default function Home() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeCard, setActiveCard] = useState(null);

  const quotationCards = [
    { 
      id: 1, 
      title: "Generate Quotes", 
      Icon: FaPlus, 
      colors: ["#1e40af", "#3b82f6", "#93c5fd", "#3b82f6", "#1e40af"],
      route: "/quotation/QuoteManager", 
      image: "/download.jpg" 
    },
    { 
      id: 2, 
      title: "View Quotes", 
      Icon: FaEye, 
      colors: ["#065f46", "#10b981", "#6ee7b7", "#10b981", "#065f46"],
      route: "/quotation/QuoteList", 
      image: "https://images.unsplash.com/photo-1556155092-490a1ba16284?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    },
  ];

  return (
    <div className="flex flex-col min-h-screen  text-white">
        <StarryBackground/>
        <BackButton route="/dashboard"/>
      {/* Main Content */}
      <div className="flex flex-col items-center flex-grow p-6 pt-20">
        <h1 className="text-4xl font-bold mb-12 text-center">Quote Management System</h1>

        {/* Accordion-Style Cards */}
        <div className="w-full max-w-7xl px-4 text-black">
        <div className="w-full max-w-7xl px-4">
          <motion.div
            className="flex gap-4 h-[500px]"
            animate={{
              marginRight: isMenuOpen ? "16rem" : "0",
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {quotationCards.map((card) => (
              <motion.div
                key={card.id}
                className="relative rounded-2xl overflow-hidden cursor-pointer shadow-xl"
                initial={{ flex: 0.7 }}
                animate={{ 
                  flex: activeCard === card.id ? 2 : 0.7,
                  scale: activeCard === card.id ? 1.03 : 1 
                }}
                onHoverStart={() => setActiveCard(card.id)}
                onHoverEnd={() => setActiveCard(null)}
                onClick={() => router.push(card.route)}
                transition={{ 
                  type: "spring", 
                  stiffness: 260,
                  damping: 20
                }}
              >
                <motion.div
                  className="absolute inset-0"
                  style={{
                    background: `linear-gradient(45deg, ${card.colors.join(', ')})`,
                    backgroundSize: "400% 400%"
                  }}
                  animate={{
                    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                />

                <motion.div 
                  className="absolute inset-0 bg-black/20 transition-all duration-300"
                  style={{ 
                    backgroundImage: `url(${card.image})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center"
                  }}
                  animate={{
                    opacity: activeCard === card.id ? 1 : 0
                  }}
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
                  <motion.h2 
                    className="text-2xl font-bold text-center whitespace-nowrap"
                    animate={{ 
                      fontSize: activeCard === card.id ? "2rem" : "1.5rem",
                      marginBottom: activeCard === card.id ? "1.5rem" : "1rem",
                      rotate: activeCard === card.id ? 0 : -90,
                      transformOrigin: "center"
                    }}
                  >
                    {card.title}
                  </motion.h2>
                  <motion.div
                    animate={{
                      opacity: activeCard === card.id ? 1 : 0
                    }}
                  >
                    <card.Icon className="text-4xl mb-4" />
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full backdrop-blur-sm text-white py-4 text-center mt-auto">
        <p className="text-sm">© {new Date().getFullYear()} Quote Management System</p>
      </footer>
    </div>
  );
}