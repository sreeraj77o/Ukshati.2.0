"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { EnvelopeIcon, LockClosedIcon, EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { Navbar, NavbarBrand, NavbarContent, NavbarItem } from "@heroui/react";
import Link from "next/link";
import Image from "next/image";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import InitialLoader from "@/components/InitialLoader";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("employee");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [viewportHeight, setViewportHeight] = useState("100vh");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setIsClient(true);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("userRole");

    // Handle mobile viewport height
    const setHeight = () => {
      const vh = window.innerHeight * 0.01;
      setViewportHeight(`${window.innerHeight}px`);
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    setHeight();
    window.addEventListener('resize', setHeight);
    return () => window.removeEventListener('resize', setHeight);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setProgress(0);
  
    // Simulate progress (remove this in production)
    const interval = setInterval(() => {
      setProgress(prev => Math.min(prev + Math.random() * 10, 90));
    }, 200);

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
          password: password.trim(),
          role: role.toLowerCase().trim(),
        }),
      });
      
      clearInterval(interval);
      setProgress(100);

      await new Promise(resolve => setTimeout(resolve, 500));
      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Login failed. Please try again.");

      // Store authentication data
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("userRole", data.user.role);
      localStorage.setItem("userEmail", data.user.email);
      
      // Replace history to prevent back navigation
      window.history.replaceState(null, null, window.location.href);
      router.push("/dashboard");

    } catch (err) {
      clearInterval(interval);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  const LoadingOverlay = ({ progress }) => (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center space-y-4">
      <div className="relative w-48 h-1 bg-gray-800 rounded-full overflow-hidden">
        <div 
          className="absolute left-0 h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      
      {/* Cyber-style terminal animation */}
      <div className="font-mono text-sm text-cyan-400 flex items-center">
        <span className="mr-2">⠋</span>
        <span className="animate-pulse">Authenticating</span>
        <span className="typing-dots">
          <span className="animate-blink">.</span>
          <span className="animate-blink delay-75">.</span>
          <span className="animate-blink delay-150">.</span>
        </span>
      </div>
  
      {/* ASCII Art Progress */}
      <div className="text-gray-400 text-xs text-center mt-4">
        <pre className="text-cyan-300">
          {`[${'■'.repeat(Math.floor(progress/10))}${'□'.repeat(10 - Math.floor(progress/10))}]`}
        </pre>
        <span className="text-cyan-400">{progress}%</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col" style={{ height: viewportHeight }}>
      <InitialLoader progress={progress} />
      {/* Prevent zoom on mobile */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      
      {/* Background */}
      <motion.div
        className="absolute inset-0 z-0"
        initial="initial"
        animate="animate"
        style={{
          background: `linear-gradient(-45deg, 
            #0a192f 0%, 
            #172a45 25%, 
            rgb(0, 0, 0) 50%, 
            rgb(0, 0, 0) 75%, 
            rgb(0, 0, 0) 100%)`,
          backgroundSize: "400% 400%"
        }}
      />
      
      {/* Navbar */}
      <div className="fixed top-0 left-0 w-full z-50">
        <Navbar className="backdrop-blur-sm py-2 md:py-4 shadow-lg">
          <NavbarBrand>
            <Link href="/" className="flex items-center">
              <Image 
                src="/lg.png" 
                alt="Ukshati Logo" 
                width={180} 
                height={120} 
                className="cursor-pointer hover:opacity-80 transition-opacity w-32 md:w-40"
                priority
              />
            </Link>
          </NavbarBrand>
        </Navbar>
      </div>

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center p-4 pt-24 pb-16">
        <div className="bg-white bg-opacity-10 p-4 md:p-8 rounded-xl shadow-xl w-full max-w-xs md:max-w-md transform transition duration-300 hover:scale-[1.01] hover:shadow-[0px_4px_20px_rgba(0,255,255,0.3)]">
          <div className="text-center mb-6">
            <h2 className="text-xl md:text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Welcome Back
            </h2>
            <p className="text-gray-300 mt-2 text-xs md:text-sm">
              Please login to continue
            </p>
          </div>

          {error && (
            <div className="mb-4 p-2 bg-red-900/50 rounded-lg border border-red-700">
              <p className="text-red-300 text-xs text-center">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-3">
              {/* Role Selection */}
              <div className="relative">
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 text-white text-sm"
                >
                  <option value="employee">Employee</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>

              {/* Email Input */}
              <div className="relative">
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400 text-sm"
                  placeholder="Enter email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {/* Password Input */}
              <div className="relative">
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400 text-sm pr-10"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="mt-2 flex items-center">
                  <input
                    type="checkbox"
                    id="showPassword"
                    checked={showPassword}
                    onChange={() => setShowPassword(!showPassword)}
                    className="h-3 w-3 border-gray-300 rounded focus:ring-blue-500 text-blue-600"
                  />
                  <label htmlFor="showPassword" className="ml-2 text-xs text-gray-300">
                    Show Password
                  </label>
                </div>
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2 px-4 rounded-lg font-medium transition-all text-sm ${
                loading 
                  ? "bg-gray-600 cursor-not-allowed" 
                  : "bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
              } text-white`}
            >
              {loading ? "Authenticating..." : "Login"}
            </button>
          </form>
        </div>
      </main>

      {/* Fixed Footer */}
      <div className="fixed inset-x-0 bottom-0 z-50">
        <Footer />
      </div>
      {loading && <LoadingOverlay progress={progress} />}
    </div>
  );
}