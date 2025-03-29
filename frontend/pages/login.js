"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import { FaFacebook, FaInstagram, FaLinkedin, FaTwitter } from "react-icons/fa";
import { Navbar, NavbarBrand, NavbarContent, NavbarItem } from "@heroui/react";
import Link from "next/link";
import Image from "next/image";
import Footer from "@/components/Footer";

// Dynamically import StarryBackground with no SSR to prevent hydration issues
const StarryBackground = dynamic(
  () => import("@/components/StarryBackground"),
  { ssr: false }
);

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("employee");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Clear previous session on component mount
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("userRole");
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

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

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed. Please try again.");
      }

      // Store authentication data
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("userRole", data.user.role);
      localStorage.setItem("userEmail", data.user.email);
      
      router.push("/dashboard");

    } catch (err) {
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

  return (
    <div className="min-h-screen flex flex-col">
      {/* Background */}
      {isClient && <StarryBackground />}
      
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
          <NavbarContent justify="end"></NavbarContent>
        </Navbar>
      </div>

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center p-4 pt-24 pb-16">
        <div className="bg-white bg-opacity-10 p-6 md:p-8 rounded-lg shadow-xl w-full max-w-md transform transition duration-300 hover:scale-[1.01] hover:shadow-[0px_4px_20px_rgba(0,255,255,0.3)] hover:backdrop-blur-lg">
          <div className="text-center mb-6 md:mb-8">
            <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Welcome Back
            </h2>
            <p className="text-gray-300 mt-1 md:mt-2 text-sm md:text-base">
              Please login to continue
            </p>
          </div>

          {error && (
            <div className="mb-4 md:mb-6 p-2 md:p-3 bg-red-900/50 rounded-lg border border-red-700">
              <p className="text-red-300 text-xs md:text-sm text-center">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 md:space-y-6">
            <div className="space-y-3 md:space-y-4">
              {/* Role Selection */}
              <div className="group relative">
                <label className="block text-xs md:text-sm font-medium text-gray-300 mb-1 md:mb-2">
                  Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3 py-2 md:px-4 md:py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white transition-all text-sm md:text-base"
                >
                  <option value="employee">Employee</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>

              {/* Email Input */}
              <div className="group relative">
                <label className="block text-xs md:text-sm font-medium text-gray-300 mb-1 md:mb-2">
                  Email
                </label>
                <input
                  type="email"
                  className="w-full px-3 py-2 md:px-4 md:py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 transition-all text-sm md:text-base"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {/* Password Input */}
              <div className="group relative">
                <label className="block text-xs md:text-sm font-medium text-gray-300 mb-1 md:mb-2">
                  Password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full px-3 py-2 md:px-4 md:py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 transition-all text-sm md:text-base"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <div className="mt-2 md:mt-3 flex items-center">
                  <input
                    type="checkbox"
                    id="showPassword"
                    checked={showPassword}
                    onChange={() => setShowPassword(!showPassword)}
                    className="h-3 w-3 md:h-4 md:w-4 border-gray-300 rounded focus:ring-blue-500 text-blue-600"
                  />
                  <label htmlFor="showPassword" className="ml-2 text-xs md:text-sm text-gray-300">
                    Show Password
                  </label>
                </div>
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2 md:py-3 px-4 md:px-6 rounded-lg font-medium md:font-semibold transition-all text-sm md:text-base ${
                loading 
                  ? "bg-gray-600 cursor-not-allowed" 
                  : "bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 hover:shadow-lg"
              } text-white`}
            >
              {loading ? "Authenticating..." : "Login to System"}
            </button>
          </form>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}