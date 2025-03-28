import toast, { Toaster } from "react-hot-toast";
import { Navigate, Route, Router, Routes } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import ProtectedRoute from "./pages/ProtectedRoute";
import Dashboard from "./pages/Dashboard";

function App() {
  return (
    <main className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
      <Routes>
      <Route path="/" element={<Dashboard />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </main>
  );
}

export default App;
