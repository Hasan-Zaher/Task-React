import { Navigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { observer } from "mobx-react-lite";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { token } = useApp();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default observer(ProtectedRoute);
