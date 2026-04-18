import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Home         from "./pages/Home";
import ServicesPage from "./pages/ServicesPage";
import Dashboard    from "./pages/Dashboard";
import Layout       from "./components/Layout";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Dashboard sans layout vitrine */}
        <Route path="/dashboard/*" element={<Dashboard />} />

        {/* Site vitrine */}
        <Route
          path="/*"
          element={
            <Layout>
              <Routes>
                <Route path="/"         element={<Home />} />
                <Route path="/services" element={<ServicesPage />} />
                <Route path="*"         element={<Navigate to="/" replace />} />
              </Routes>
            </Layout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
