import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { DashboardHeader } from "@/components/DashboardHeader";
import { PerformanceCards } from "@/components/PerformanceCards";
import { MetricsSection } from "@/components/MetricsSection";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Delivery from "./dashboard/Delivery";
import Orders from "./dashboard/Orders";
import Menu from "./dashboard/Menu";
import Reviews from "./dashboard/Reviews";
import Catalog from "./dashboard/Catalog";
import Logistics from "./dashboard/Logistics";
import DeliveryTime from "./dashboard/DeliveryTime";
import DeliveryArea from "./dashboard/DeliveryArea";
import PaymentTime from "./dashboard/PaymentTime";
import Promotions from "./dashboard/Promotions";
import Services from "./dashboard/Services";
import Profile from "./dashboard/Profile";

const Dashboard = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <DashboardSidebar />
        
        <main className="flex-1 flex flex-col">
          <DashboardHeader />
          
          <div className="flex-1 p-6">
            <Routes>
              <Route index element={
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold text-foreground">
                      Olá, {user.storeName || 'Dono da Loja'}!
                    </h1>
                    <div className="text-sm text-muted-foreground">
                      {user.storeId && `ID da Loja: ${user.storeId}`}
                    </div>
                  </div>
                  <PerformanceCards />
                  <MetricsSection />
                </div>
              } />
              <Route path="delivery" element={<Delivery />} />
              <Route path="orders" element={<Orders />} />
              <Route path="menu" element={<Menu />} />
              <Route path="reviews" element={<Reviews />} />
              <Route path="catalog" element={<Catalog />} />
              <Route path="logistics" element={<Logistics />} />
              <Route path="delivery-time" element={<DeliveryTime />} />
              <Route path="delivery-area" element={<DeliveryArea />} />
              <Route path="payment-time" element={<PaymentTime />} />
              <Route path="promotions" element={<Promotions />} />
              <Route path="services" element={<Services />} />
              <Route path="profile" element={<Profile />} />
            </Routes>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
