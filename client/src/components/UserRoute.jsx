import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { getProfile, isUserRole } from "../lib/auth.js";

const UserRoute = ({ children }) => {
  const [status, setStatus] = useState({
    loading: true,
    allowed: false,
  });

  useEffect(() => {
    let mounted = true;

    const checkProfile = async () => {
      try {
        const profile = await getProfile();
        if (!mounted) return;
        setStatus({
          loading: false,
          allowed: Boolean(profile) && isUserRole(profile.role),
        });
      } catch {
        if (!mounted) return;
        setStatus({ loading: false, allowed: false });
      }
    };

    checkProfile();
    return () => {
      mounted = false;
    };
  }, []);

  if (status.loading) {
    return <div className="client-empty-state">Checking your account...</div>;
  }

  if (!status.allowed) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default UserRoute;
