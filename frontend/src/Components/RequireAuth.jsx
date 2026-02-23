import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_URL || "";



const RequireAuth = ({ children, allowedRoles = [] }) => {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState(null);

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/auth/profile`, {
          credentials: "include",
        });

        if (!res.ok) {
          setIsAuthenticated(false);
          return;
        }

        const user = await res.json();
        const resolvedRole = user?.role ?? user?.user?.role ?? null;
        setIsAuthenticated(true);
        setRole(resolvedRole);
      } catch (error) {
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAccess();
  }, []);

  if (loading) return <div>Loading...</div>;

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const normalizedRole = String(role || "").trim().toLowerCase();
  const normalizedAllowedRoles = allowedRoles.map((r) =>
    String(r || "").trim().toLowerCase()
  );

  if (
    normalizedAllowedRoles.length > 0 &&
    !normalizedAllowedRoles.includes(normalizedRole)
  ) {
    return <Navigate to="/welcome" replace />;
  }

  return children;
};

export default RequireAuth;
