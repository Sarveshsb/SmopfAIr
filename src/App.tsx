import { useAuth } from "./contexts/AuthContext";
import Dashboard from "./pages/Dashboard";
import SetupFlow from "./components/SetupFlow";

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <p className="text-gray-600">Loading SmopfAIr...</p>
      </div>
    );
  }

  // ⛔ NO LOGIN PAGE ANYMORE
  // If user is new → always show SetupFlow
  // After setup → go to Dashboard

  return user ? <Dashboard /> : <SetupFlow onComplete={() => {}} />;
}

export default App;
