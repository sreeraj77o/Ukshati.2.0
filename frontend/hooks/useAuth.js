import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

/**
 * Custom hook for authentication and user management
 * @returns {Object} User data, authentication state, and operations
 */
export const useAuth = () => {
  const router = useRouter();
  const [userData, setUserData] = useState({});
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserData = () => {
      try {
        const storedUser = localStorage.getItem("user");
        const storedRole = localStorage.getItem("userRole");

        if (!storedUser || !storedRole) {
          router.push("/");
          return;
        }

        const parsedUser = JSON.parse(storedUser);
        setUserData({
          name: parsedUser.name,
          email: parsedUser.email,
          phone: parsedUser.phone || 'N/A'
        });
        setUserRole(storedRole.toLowerCase());
      } catch (error) {
        console.error("Session load error:", error);
        router.push("/");
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [router]);

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("userRole");
    localStorage.removeItem("token");
    router.push("/");
  };

  const isAdmin = userRole === 'admin';

  return {
    userData,
    userRole,
    loading,
    logout,
    isAdmin
  };
};
