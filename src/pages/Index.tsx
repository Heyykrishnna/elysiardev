
import ProtectedRoute from "@/components/ProtectedRoute";
import Dashboard from "@/components/dashboard/Dashboard";

const Index = () => {
  return (
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  );
};

export default Index;
