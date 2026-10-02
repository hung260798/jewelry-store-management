import { useUser } from "@/hooks/stores/useAuthStore";
import Information from "@/pages/Account/Information";
import HomePage from "@/pages/HomePage";
import CategoryCRUD from "@/pages/Management/CategoryCRUD";
import CollectionCRUD from "@/pages/Management/CollectionCRUD";
import CustomerCRUD from "@/pages/Management/CustomerCRUD";
import EmployeesCRUD from "@/pages/Management/EmployeesCRUD";
import FeaturesCRUD from "@/pages/Management/FeaturesCRUD";
import FileManagerCRUD from "@/pages/Management/FileManagerCRUD";
import ProductCRUD from "@/pages/Management/ProductsCRUD";
import SlidesCRUD from "@/pages/Management/SlideCRUD";
import SuppliersCRUD from "@/pages/Management/SuppliersCRUD";
import NotFoundPage from "@/pages/NotFoundPage";
import Orders from "@/pages/Order/Orders";
import SearchOrdersByStatus from "@/pages/Order/SearchOrdersByStatus";
import { Layout } from "antd";
import React from "react";
import { Route, Routes } from "react-router-dom";
import ErrorBoundary from "./ErrorBoundary";
import Error from "./Placeholders/Error";

const MainContent = React.memo(() => {
  const authUser = useUser();
  if (!authUser) return null;

  return (
    <ErrorBoundary fallback={<Error />}>
      <Layout.Content className="m-0 p-0 md:px-2 md:py-2">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="dashboard/home" element={<HomePage />} />
          {authUser.isAdmin && (
            <Route path="/management/employees" element={<EmployeesCRUD />} />
          )}
          <Route path="/management/products" element={<ProductCRUD />} />
          <Route path="/function/slides" element={<SlidesCRUD />} />
          <Route path="/function/features" element={<FeaturesCRUD />} />
          <Route path="/function/files" element={<FileManagerCRUD />} />
          <Route path="/management/suppliers" element={<SuppliersCRUD />} />
          <Route path="/management/categories" element={<CategoryCRUD />} />
          <Route path="/management/customers" element={<CustomerCRUD />} />
          <Route path="/management/collections" element={<CollectionCRUD />} />
          <Route path="/order/orders" element={<Orders />} />
          <Route path="/order/status" element={<SearchOrdersByStatus />} />
          <Route path="/account/information" element={<Information />} />
          {/* <Route path="/general-update" element={<UpdatePage />} /> */}
          {/* <Route path="/ckeditor" element={<CKEditorPage />} /> */}
          {/* <Route path="/experiment" element={<Experiment />} /> */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Layout.Content>
    </ErrorBoundary>
  );
});

export default MainContent;
