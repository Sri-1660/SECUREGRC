import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Sidebar from "./components/layout/Sidebar";
import Topbar from "./components/layout/Topbar";

import Dashboard from "./pages/Dashboard";
import Assets from "./pages/Assets";
import Reports from "./pages/Reports";
import Audits from "./pages/Audits";
import Gaps from "./pages/Gaps";
import Risks from "./pages/Risks";
import Login from "./pages/Login";
import Evidence from "./pages/Evidence";
import Settings from "./pages/Settings";
import Controls from "./pages/Controls";
import Compliance from "./pages/Compliance";
import Remediation from "./pages/Remediation";
import Policies from "./pages/Policies";
import AIAssistant from "./pages/AIAssistant";

import { GRCProvider } from "./context/GRCContext";

function AppLayout() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Sidebar />

      <Topbar />

      <main className="ml-64 min-h-screen pt-20">
        <Routes>
          <Route path="/" element={<Dashboard />} />

          <Route path="/policies" element={<Policies />} />

          <Route path="/ai-assistant" element={<AIAssistant />} />

          <Route path="/audits" element={<Audits />} />

          <Route path="/assets" element={<Assets />} />

          <Route path="/remediation" element={<Remediation />} />

          <Route path="/reports" element={<Reports />} />

          <Route path="/gaps" element={<Gaps />} />

          <Route path="/risks" element={<Risks />} />

          <Route path="/settings" element={<Settings />} />

          <Route path="/compliance" element={<Compliance />} />

          <Route path="/evidence" element={<Evidence />} />

          <Route path="/controls" element={<Controls />} />
        </Routes>
      </main>
    </div>
  );
}

function ProtectedApp() {
  const isAuthenticated =
    localStorage.getItem("securegrc_authenticated") === "true";

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <AppLayout />;
}

function App() {
  return (
    <BrowserRouter>
      <GRCProvider>
        <Routes>

          {/* Login */}
          <Route path="/login" element={<Login />} />

          {/* Protected Application */}
          <Route path="/*" element={<ProtectedApp />} />

        </Routes>
      </GRCProvider>
    </BrowserRouter>
  );
}

export default App;