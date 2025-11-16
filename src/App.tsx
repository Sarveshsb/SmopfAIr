import { useState } from "react";
import Dashboard from "./pages/Dashboard";
import SetupFlow from "./components/SetupFlow";

function App() {
  const [isSetupComplete, setIsSetupComplete] = useState(false);

  if (!isSetupComplete) {
    return <SetupFlow onComplete={() => setIsSetupComplete(true)} />;
  }

  return <Dashboard />;
}

export default App;
