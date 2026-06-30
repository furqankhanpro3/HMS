import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HostelProvider } from "@/context/HostelContext";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import Dashboard from "./pages/Dashboard";
import Admissions from "./pages/Admissions";
import Hostels from "./pages/Hostels";
import MessManagement from "./pages/MessManagement";
import StudentTracking from "./pages/StudentTracking";
import StudentProfile from "./pages/StudentProfile";
import StudentMess from "./pages/StudentMess";
import StudentComplaints from "./pages/StudentComplaints";
import ComplaintManagement from "./pages/ComplaintManagement";
import Login from "./pages/Login";
import Admins from "./pages/Admins";
import StaffManagement from "./pages/StaffManagement";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import { Navigate } from "react-router-dom";
import StudentPortal from "./pages/StudentPortal";
import Inventory from "./MyComponents/Inventory";
import Fee from "./MyComponents/Fee";
import Income from "./MyComponents/Income";
import Expense from "./MyComponents/Expense";

const queryClient = new QueryClient();

const ProtectedRoute = ({
  children,
  adminOnly = false,
  superAdminOnly = false,
  module,
  action = "view",
}) => {
  const { user, loading, hasPermission } = useAuth();

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center font-display text-xl animate-pulse">
        Loading...
      </div>
    );
  if (!user) return <Navigate to="/login" replace />;

  const hasAdminAccess =
    user.role === "admin" || user.role === "superadmin" || user.isAdmin;
  const hasSuperAdminAccess = user.role === "superadmin";

  if (superAdminOnly && !hasSuperAdminAccess) {
    return <Navigate to="/" replace />;
  }

  if (adminOnly && !hasAdminAccess) {
    return <Navigate to="/" replace />;
  }

  if (module && !hasPermission(module, action)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const RoleBasedHome = () => {
  const { user, loading } = useAuth();
  if (loading)
    return (
      <div className="flex h-screen items-center justify-center font-display text-xl animate-pulse">
        Loading...
      </div>
    );
  if (!user) return <Navigate to="/login" replace />;

  const hasAdminAccess =
    user.role === "admin" || user.role === "superadmin" || user.isAdmin;
  if (hasAdminAccess) {
    return <Navigate to="/admin/dashboard" replace />;
  }
  return <StudentPortal />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <HostelProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />

              {/* Home - Role Based Entry Point */}
              <Route path="/" element={<RoleBasedHome />} />

              {/* Admin Portal Group */}
              <Route path="/admin">
                <Route
                  index
                  element={<Navigate to="/admin/dashboard" replace />}
                />
                <Route
                  path="dashboard"
                  element={
                    <ProtectedRoute adminOnly>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="fee"
                  element={
                    <ProtectedRoute adminOnly>
                      <Fee />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="income"
                  element={
                    <ProtectedRoute adminOnly>
                      <Income />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="expense"
                  element={
                    <ProtectedRoute adminOnly>
                      <Expense />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="inventory"
                  element={
                    <ProtectedRoute adminOnly>
                      <Inventory />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="admissions"
                  element={
                    <ProtectedRoute adminOnly>
                      <Admissions />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="hostels"
                  element={
                    <ProtectedRoute adminOnly>
                      <Hostels />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="mess"
                  element={
                    <ProtectedRoute adminOnly>
                      <MessManagement />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="tracking"
                  element={
                    <ProtectedRoute adminOnly>
                      <StudentTracking />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="admins"
                  element={
                    <ProtectedRoute adminOnly module="admins" action="view">
                      <Admins />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="profile"
                  element={
                    <ProtectedRoute adminOnly>
                      <Profile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="complaints"
                  element={
                    <ProtectedRoute adminOnly>
                      <ComplaintManagement />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="staff"
                  element={
                    <ProtectedRoute adminOnly>
                      <StaffManagement />
                    </ProtectedRoute>
                  }
                />
              </Route>

              {/* Student Sub-Routes */}
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <StudentProfile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/mess-info"
                element={
                  <ProtectedRoute>
                    <StudentMess />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/complaints"
                element={
                  <ProtectedRoute>
                    <StudentComplaints />
                  </ProtectedRoute>
                }
              />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </HostelProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
