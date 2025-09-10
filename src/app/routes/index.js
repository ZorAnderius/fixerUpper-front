import { createBrowserRouter } from "react-router-dom";
import { ROUTES } from "../../helpers/constants/routes";
import PrivateRoute from "../../components/PrivateRoute/PrivateRoute";
import PublicRoute from "../../components/PublicRoute/PublicRoute";
import NotFoundPage from "../../pages/NotFoundPage/NotFoundPage";

// Lazy loading functions
const HomePage = async () => {
  const mod = await import("../../pages/HomePage/HomePage");
  return { Component: mod.default };
};

const SharedLayout = async () => {
  const mod = await import("../../pages/SharedLayout/SharedLayout");
  return { Component: mod.default };
};

const RegisterPage = async () => {
  const mod = await import("../../pages/RegisterPage/RegisterPage");
  const PublicRouteMod = await import("../../components/PublicRoute/PublicRoute");
  const RegisterPageComponent = mod.default;
  const PublicRouteComponent = PublicRouteMod.default;
  
  return { 
    Component: function WrappedRegisterPage() {
      return PublicRouteComponent({ children: RegisterPageComponent() });
    }
  };
};

const LoginPage = async () => {
  const mod = await import("../../pages/LoginPage/LoginPage");
  const PublicRouteMod = await import("../../components/PublicRoute/PublicRoute");
  const LoginPageComponent = mod.default;
  const PublicRouteComponent = PublicRouteMod.default;
  
  return { 
    Component: function WrappedLoginPage() {
      return PublicRouteComponent({ children: LoginPageComponent() });
    }
  };
};

const ProductsPage = async () => {
  const mod = await import("../../pages/ProductsPage/ProductsPage");
  return { Component: mod.default };
};

const ProductDetailsPage = async () => {
  const mod = await import("../../pages/ProductDetailsPage/ProductDetailsPage");
  return { Component: mod.default };
};

const OrdersPage = async () => {
  const mod = await import("../../pages/OrdersPage/OrdersPage");
  const PrivateRouteMod = await import("../../components/PrivateRoute/PrivateRoute");
  const OrdersPageComponent = mod.default;
  const PrivateRouteComponent = PrivateRouteMod.default;
  
  return { 
    Component: function WrappedOrdersPage() {
      return PrivateRouteComponent({ children: OrdersPageComponent() });
    }
  };
};

const OrderDetailPage = async () => {
  const mod = await import("../../pages/OrderDetailPage/OrderDetailPage");
  const PrivateRouteMod = await import("../../components/PrivateRoute/PrivateRoute");
  const OrderDetailPageComponent = mod.default;
  const PrivateRouteComponent = PrivateRouteMod.default;
  
  return { 
    Component: function WrappedOrderDetailPage() {
      return PrivateRouteComponent({ children: OrderDetailPageComponent() });
    }
  };
};

const CartPage = async () => {
  const mod = await import("../../pages/CartPage/CartPage");
  const PrivateRouteMod = await import("../../components/PrivateRoute/PrivateRoute");
  const CartPageComponent = mod.default;
  const PrivateRouteComponent = PrivateRouteMod.default;
  
  return { 
    Component: function WrappedCartPage() {
      return PrivateRouteComponent({ children: CartPageComponent() });
    }
  };
};

const ProfilePage = async () => {
  const mod = await import("../../pages/ProfilePage/ProfilePage");
  const PrivateRouteMod = await import("../../components/PrivateRoute/PrivateRoute");
  const ProfilePageComponent = mod.default;
  const PrivateRouteComponent = PrivateRouteMod.default;
  
  return { 
    Component: function WrappedProfilePage() {
      return PrivateRouteComponent({ children: ProfilePageComponent() });
    }
  };
};

const AdminPage = async () => {
  const mod = await import("../../pages/AdminPage/AdminPage");
  const PrivateRouteMod = await import("../../components/PrivateRoute/PrivateRoute");
  const AdminPageComponent = mod.default;
  const PrivateRouteComponent = PrivateRouteMod.default;
  
  return { 
    Component: function WrappedAdminPage() {
      return PrivateRouteComponent({ children: AdminPageComponent() });
    }
  };
};

const GoogleAuthCallback = async () => {
  const mod = await import("../../components/GoogleAuthCallback/GoogleAuthCallback");
  return { Component: mod.default };
};

// Error element component
const ErrorElement = () => {
  return <NotFoundPage />;
};


export const router = createBrowserRouter([
  {
    path: "/",
    lazy: SharedLayout,
    errorElement: ErrorElement,
    children: [
      { index: true, lazy: HomePage },
      { path: ROUTES.REGISTER, lazy: RegisterPage },
      { path: ROUTES.LOGIN, lazy: LoginPage },
      { path: ROUTES.PRODUCTS, lazy: ProductsPage },
      { path: ROUTES.PRODUCT_DETAILS, lazy: ProductDetailsPage },
      { path: ROUTES.ORDERS, lazy: OrdersPage },
      { path: ROUTES.ORDER_DETAILS, lazy: OrderDetailPage },
      { path: ROUTES.CART, lazy: CartPage },
      { path: ROUTES.PROFILE, lazy: ProfilePage },
      { path: ROUTES.ADMIN, lazy: AdminPage },
      { path: ROUTES.GOOGLE_CALLBACK, lazy: GoogleAuthCallback },
    ],
  },
]);


