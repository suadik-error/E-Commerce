import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import SignUpPage from "./Pages/SignupPage";
import LoginPage from "./Pages/LoginPage";
import AdminForm from "./Pages/AdminForm";

import Navbar from "./Components/Navbar";
import RequireAuth from "./Components/RequireAuth.jsx";
import WelcomePage from "./Pages/WelcomePage.jsx";
import DashboardLayout from "./Admin/DashboardLayout.jsx";
import Users from "./Components/Users.jsx";
import Products from "./Components/Products.jsx";
import Payments from "./Components/Payments.jsx";
import Settings from "./Components/Settings.jsx";
import Orders from "./Components/Orders.jsx";
import Analytics from "./Components/Analytics.jsx";
import Messages from "./Components/Messages.jsx";
import Security from "./Components/Security.jsx";

// Admin Dashboard Components
import AdminOverview from "./Admin/Overview.jsx";
import Managers from "./Admin/Managers.jsx";
import AgentDetails from "./Admin/AgentDetails.jsx";
import PaymentConfirmation from "./Admin/PaymentConfirmation.jsx";

// Manager Dashboard
import ManagerDashboardLayout from "./Manager/DashboardLayout.jsx";
import ManagerAgents from "./Manager/Agents.jsx";
import ManagerWorkers from "./Manager/Workers.jsx";
import ManagerProducts from "./Manager/Products.jsx";
import ManagerSales from "./Manager/Sales.jsx";
import ManagerPayments from "./Manager/Payments.jsx";
import ManagerOverview from "./Manager/Overview.jsx";

// Agent Dashboard
import AgentDashboardLayout from "./Agent/DashboardLayout.jsx";
import AgentProducts from "./Agent/Products.jsx";
import AgentSales from "./Agent/Sales.jsx";
import AgentProfile from "./Agent/Profile.jsx";
import AgentOverview from "./Agent/Overview.jsx";

function App() {
  return (
    <Router>
      <Navbar />
      <div className="Main-Container">
        <Routes>
          <Route path="/" element={<WelcomePage />} />

          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/admin-request" element={<AdminForm />} />
          <Route path="/welcome" element={<WelcomePage />} />
          <Route path="/products" element={<div>Products Page</div>} />
          <Route path="/orders" element={<div>Orders Page</div>} />
          <Route path="/cart" element={<div>Cart Page</div>} />

          {/* Admin Dashboard Routes */}
          <Route
            path="/dashboard"
            element={
              <RequireAuth allowedRoles={["admin"]}>
                <DashboardLayout />
              </RequireAuth>
            }
          >
            <Route index element={<AdminOverview />} />
            <Route path="overview" element={<AdminOverview />} />
            <Route path="managers" element={<Managers />} />
            <Route path="agents" element={<Users />} />
            <Route path="agents/:id" element={<AgentDetails />} />
            <Route path="products" element={<Products />} />
            <Route path="payments" element={<PaymentConfirmation />} />
            <Route path="orders" element={<Orders />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="messages" element={<Messages />} />
            <Route path="security" element={<Security />} />
            <Route path="users" element={<Users />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* Manager Dashboard Routes */}
          <Route
            path="/manager"
            element={
              <RequireAuth allowedRoles={["manager"]}>
                <ManagerDashboardLayout />
              </RequireAuth>
            }
          >
            <Route index element={<ManagerOverview />} />
            <Route path="agents" element={<ManagerAgents />} />
            <Route path="workers" element={<ManagerWorkers />} />
            <Route path="products" element={<ManagerProducts />} />
            <Route path="sales" element={<ManagerSales />} />
            <Route path="payments" element={<ManagerPayments />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* Agent Dashboard Routes */}
          <Route
            path="/agent"
            element={
              <RequireAuth allowedRoles={["agent"]}>
                <AgentDashboardLayout />
              </RequireAuth>
            }
          >
            <Route index element={<AgentOverview />} />
            <Route path="products" element={<AgentProducts />} />
            <Route path="sales" element={<AgentSales />} />
            <Route path="profile" element={<AgentProfile />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
