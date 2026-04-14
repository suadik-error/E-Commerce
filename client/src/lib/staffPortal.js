const PORTAL_MAP = {
  admin: {
    path: "/dashboard",
    label: "Admin Portal",
  },
  manager: {
    path: "/manager",
    label: "Manager Portal",
  },
  agent: {
    path: "/agent",
    label: "Agent Portal",
  },
};

export const getStaffPortal = (role) => PORTAL_MAP[String(role || "").trim().toLowerCase()] || null;
