import { BrowserRouter as Router, Navigate, Route, Routes } from "react-router-dom";
import ClientLayout from "./components/ClientLayout.jsx";
import UserRoute from "./components/UserRoute.jsx";
import HomePage from "./pages/HomePage.jsx";
import CompaniesPage from "./pages/CompaniesPage.jsx";
import CompanyPage from "./pages/CompanyPage.jsx";
import ProductsPage from "./pages/ProductsPage.jsx";
import ProductDetailsPage from "./pages/ProductDetailsPage.jsx";
import CartPage from "./pages/CartPage.jsx";
import CheckoutPage from "./pages/CheckoutPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import SignupPage from "./pages/SignupPage.jsx";
import AccountPage from "./pages/AccountPage.jsx";

function App() {
  return (
    <Router>
      <ClientLayout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/companies" element={<CompaniesPage />} />
          <Route path="/companies/:companyId" element={<CompanyPage />} />
          <Route
            path="/companies/:companyId/store"
            element={
              <UserRoute>
                <ProductsPage />
              </UserRoute>
            }
          />
          <Route
            path="/companies/:companyId/products/:productId"
            element={
              <UserRoute>
                <ProductDetailsPage />
              </UserRoute>
            }
          />
          <Route
            path="/cart"
            element={
              <UserRoute>
                <CartPage />
              </UserRoute>
            }
          />
          <Route
            path="/checkout"
            element={
              <UserRoute>
                <CheckoutPage />
              </UserRoute>
            }
          />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route
            path="/account"
            element={
              <UserRoute>
                <AccountPage />
              </UserRoute>
            }
          />
          <Route path="/products" element={<Navigate to="/companies" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ClientLayout>
    </Router>
  );
}

export default App;
