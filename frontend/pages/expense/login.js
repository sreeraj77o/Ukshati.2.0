import { useState, useEffect } from "react";
import { useRouter } from "next/router";
// import StarryBackground from "@/components/StarryBackground";
import { Navbar, NavbarBrand, NavbarContent } from "@heroui/react";
import { Link } from "@heroui/react";
import Image from "next/image";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("employee");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    // Clear previous session on component mount
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("userRole");

    // Simulate initial loading delay
    const timer = setTimeout(() => {
      setInitialLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
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
      localStorage.setItem("userRole", data.user.role); // Store role separately
      localStorage.setItem("userEmail", data.user.email);

      // Redirect based on role
      router.push(
        data.user.role === "admin" ? "/expense/home" : "/expense/home"
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-cover bg-center">
      {/* <StarryBackground /> */}
      <div className="fixed top-0 left-0 w-full z-50">
        <Navbar className="backdrop-blur-sm py-4 shadow-lg">
          <NavbarBrand>
            <Link href="/">
              <Image
                src="/lg.png"
                alt="Ukshati Logo"
                width={180}
                height={120}
                className="cursor-pointer hover:opacity-80 transition-opacity"
              />
            </Link>
          </NavbarBrand>
          <NavbarContent justify="end"></NavbarContent>
        </Navbar>
      </div>
      <div className="bg-white bg-opacity-10 p-8 rounded-lg shadow-xl w-96 transform transition duration-300 hover:scale-105 hover:shadow-[0px_4px_20px_rgba(0,255,255,0.5)] hover:backdrop-blur-lg">
        <h2 className="text-3xl font-semibold text-center text-white mb-6">
          Login
        </h2>

        {error && (
          <p className="text-red-400 text-sm text-center mb-4">{error}</p>
        )}

        {initialLoading ? (
          // Skeleton loading for the login form
          <div className="animate-pulse">
            {/* Role selection skeleton */}
            <div className="mb-4">
              <div className="h-4 bg-gray-600 rounded w-24 mb-2"></div>
              <div className="h-10 bg-gray-700 rounded w-full"></div>
            </div>

            {/* Email field skeleton */}
            <div className="mb-4">
              <div className="h-4 bg-gray-600 rounded w-16 mb-2"></div>
              <div className="h-10 bg-gray-700 rounded w-full"></div>
            </div>

            {/* Password field skeleton */}
            <div className="mb-4">
              <div className="h-4 bg-gray-600 rounded w-24 mb-2"></div>
              <div className="h-10 bg-gray-700 rounded w-full"></div>
              <div className="mt-2 flex items-center">
                <div className="h-4 w-4 bg-gray-700 rounded mr-2"></div>
                <div className="h-4 bg-gray-600 rounded w-32"></div>
              </div>
            </div>

            {/* Button skeleton */}
            <div className="h-12 bg-gradient-to-r from-gray-600 to-gray-700 rounded-md w-full mt-6"></div>
          </div>
        ) : (
          // Actual login form
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-white text-sm font-bold mb-2">
                Select Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded bg-white text-black"
              >
                <option value="employee">Employee</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div>
              <label className="block text-white text-sm font-bold mb-2">
                Email
              </label>
              <input
                type="email"
                className="w-full p-2 border border-gray-300 rounded bg-white text-black"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-white text-sm font-bold mb-2">
                Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                className="w-full p-2 border border-gray-300 rounded bg-white text-black"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <div className="mt-2">
                <input
                  type="checkbox"
                  id="showPassword"
                  checked={showPassword}
                  onChange={() => setShowPassword(!showPassword)}
                  className="mr-2"
                />
                <label htmlFor="showPassword" className="text-white text-sm">
                  Show Password
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-gradient-to-r from-teal-400 to-blue-500 text-white p-3 rounded-md font-semibold transition ${
                loading
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:from-teal-500 hover:to-blue-600"
              }`}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
