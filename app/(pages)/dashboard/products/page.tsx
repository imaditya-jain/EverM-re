import { DashboardLayout, ProtectedRoute } from "@/app/components";
import ProductsView from "@/app/components/products/products-view";

const ProductsPage = () => {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <ProductsView />
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default ProductsPage;
