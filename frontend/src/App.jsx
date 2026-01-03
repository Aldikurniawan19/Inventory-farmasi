import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./Login";
import Dashboard from "./Dashboard"; // Kita akan pindahkan kode lama ke file ini
import Inventory from "./Inventory";
import OrderPage from "./OrderPage";
import Shipping from "./Shipping";
import Reports from "./Reports";
import Purchasing from "./Purchasing";

// Komponen Pelindung (Hanya boleh masuk jika ada token)
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/" />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/inventory"
          element={
            <PrivateRoute>
              <Inventory />
            </PrivateRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <PrivateRoute>
              <OrderPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/shipping"
          element={
            <PrivateRoute>
              <Shipping />
            </PrivateRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <PrivateRoute>
              <Reports />
            </PrivateRoute>
          }
        />
        <Route
          path="/purchasing"
          element={
            <PrivateRoute>
              <Purchasing />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
