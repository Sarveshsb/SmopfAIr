import { useState, useEffect } from "react";
import Dashboard from "./pages/Dashboard";
import SetupFlow from "./components/SetupFlow";

function App() {
  const [shopData, setShopData] = useState<{ shop_name: string; business_type: string } | null>(null);
  const [products, setProducts] = useState<any[]>([]);

  const handleLogout = () => {
    console.log('User logged out');
    localStorage.removeItem('shopData');
    window.location.reload();
  };

  useEffect(() => {
    const savedShopData = localStorage.getItem('shopData');
    if (savedShopData) {
      setShopData(JSON.parse(savedShopData));
    }
  }, []);

  useEffect(() => {
    if (shopData) {
      loadProducts();
    }
  }, [shopData]);

  const loadProducts = () => {
    if (shopData) {
      const savedProducts = localStorage.getItem(`products_${shopData.shop_name}`);
      if (savedProducts) {
        setProducts(JSON.parse(savedProducts));
      }
    }
  };

  const handleSetupComplete = (data: { shop_name: string; business_type: string }) => {
    setShopData(data);
  };

  if (!shopData) {
    return <SetupFlow onComplete={handleSetupComplete} />;
  }

  return (
    <>
      <Dashboard
        shopData={shopData}
        products={products}
        onProductsChange={loadProducts}
        handleLogout={handleLogout}
      />
    </>
  );
}

export default App;
