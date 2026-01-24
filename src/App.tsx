import { useState, useEffect } from "react";
import Dashboard from "./pages/Dashboard";
import SetupFlow from "./components/SetupFlow";

function App() {
  const [shopData, setShopData] = useState<{shop_name: string; business_type: string} | null>(null);

  useEffect(() => {
    // Check if shop data exists in localStorage
    const savedShopData = localStorage.getItem('shopData');
    if (savedShopData) {
      setShopData(JSON.parse(savedShopData));
    }
  }, []);

  const handleSetupComplete = (data: {shop_name: string; business_type: string}) => {
    setShopData(data);
  };

  if (!shopData) {
    return <SetupFlow onComplete={handleSetupComplete} />;
  }

  return <Dashboard shopData={shopData} />;
}

export default App;
