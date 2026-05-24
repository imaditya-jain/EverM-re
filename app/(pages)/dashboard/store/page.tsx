import { DashboardLayout, ProtectedRoute } from "@/app/components";
import StoreConnectionView from "@/app/components/shopify/store-connection-view";

const StoreConnectionPage = () => {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <StoreConnectionView />
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default StoreConnectionPage;
