import { DashboardLayout, ProtectedRoute } from "@/app/components";
import ProductDetailView from "@/app/components/products/product-detail-view";

const ProductDetailPage = () => {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <ProductDetailView />
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default ProductDetailPage;
