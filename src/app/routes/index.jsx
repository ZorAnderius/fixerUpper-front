import { createBrowserRouter } from "react-router-dom";
import { lazy } from "react";
import { ROUTES } from "../../helpers/constants/routes";
import PrivateRoute from "../../components/PrivateRoute/PrivateRoute";
import PublicRoute from "../../components/PublicRoute/PublicRoute";
import NotFoundPage from "../../pages/NotFoundPage/NotFoundPage";

// Lazy loading components
const HomePage = lazy(() => import("../../pages/HomePage/HomePage"));
const SharedLayout = lazy(() => import("../../pages/SharedLayout/SharedLayout"));
const RegisterPage = lazy(() => import("../../pages/RegisterPage/RegisterPage"));

const LoginPage = lazy(() => import("../../pages/LoginPage/LoginPage"));
const ProductsPage = lazy(() => import("../../pages/ProductsPage/ProductsPage"));
const ProductDetailsPage = lazy(() => import("../../pages/ProductDetailsPage/ProductDetailsPage"));
const OrdersPage = lazy(() => import("../../pages/OrdersPage/OrdersPage"));
const OrderDetailPage = lazy(() => import("../../pages/OrderDetailPage/OrderDetailPage"));
const CartPage = lazy(() => import("../../pages/CartPage/CartPage"));
const ProfilePage = lazy(() => import("../../pages/ProfilePage/ProfilePage"));
const AdminPage = lazy(() => import("../../pages/AdminPage/AdminPage"));
const AddProductPage = lazy(() => import("../../pages/AdminPage/AddProductPage"));
const GoogleAuthCallback = lazy(() => import("../../components/GoogleAuthCallback/GoogleAuthCallback"));

// Error element component
const ErrorElement = () => {
  return <NotFoundPage />;
};


export const router = createBrowserRouter([
  {
    path: "/",
    element: <SharedLayout />,
    errorElement: <ErrorElement />,
    children: [
      { index: true, element: <HomePage /> },
      { path: ROUTES.REGISTER, element: <PublicRoute><RegisterPage /></PublicRoute> },
      { path: ROUTES.LOGIN, element: <PublicRoute><LoginPage /></PublicRoute> },
      { path: ROUTES.PRODUCTS, element: <ProductsPage /> },
      { path: ROUTES.PRODUCT_DETAILS, element: <ProductDetailsPage /> },
      { path: ROUTES.ORDERS, element: <PrivateRoute><OrdersPage /></PrivateRoute> },
      { path: ROUTES.ORDER_DETAILS, element: <PrivateRoute><OrderDetailPage /></PrivateRoute> },
      { path: ROUTES.CART, element: <PrivateRoute><CartPage /></PrivateRoute> },
      { path: ROUTES.PROFILE, element: <PrivateRoute><ProfilePage /></PrivateRoute> },
      { path: ROUTES.ADMIN, element: <PrivateRoute><AdminPage /></PrivateRoute> },
      { path: ROUTES.ADMIN_ADD_PRODUCT, element: <PrivateRoute><AddProductPage /></PrivateRoute> },
      { path: ROUTES.GOOGLE_CALLBACK, element: <GoogleAuthCallback /> },
    ],
  },
]);


