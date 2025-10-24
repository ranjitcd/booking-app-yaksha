
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AdminPanel from "./AdminPanel";
import ProtectedRoute from "./ProtectedRoute";
import LoginPage from "./LoginPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />

        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminPanel />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;

