import { Navigate, Route, Routes } from "react-router-dom";
import { AppBar, Box, Button, Container, Toolbar, Typography, Chip, Stack } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "./app/authSlice";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import QueryBuilderPage from "./pages/QueryBuilderPage";
import SavedQueriesPage from "./pages/SavedQueriesPage";
import AdminPage from "./pages/AdminPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import CreateTablePage from "./pages/CreateTablePage";
import MyRequestsPage from "./pages/MyRequestsPage";
import AdminRequestsPage from "./pages/AdminRequestsPage";
import { Link } from "react-router-dom";

function PrivateRoute({ children }) {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

export default function App() {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const user = useSelector((state) => state.auth.user);

  const isAdmin = user?.roles?.includes("ROLE_ADMIN");

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f8fafc" }}>
      <AppBar 
        position="sticky" 
        elevation={0}
        sx={{ 
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)", 
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          py: 0.5
        }}
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ display: "flex", justifyContent: "space-between" }}>
            <Stack direction="row" spacing={1} alignItems="center" component={Link} to="/" style={{ textDecoration: "none", color: "inherit" }}>
              <Typography variant="h5" fontWeight="900" sx={{ 
                letterSpacing: 1.5, 
                background: "linear-gradient(90deg, #38bdf8, #3b82f6)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                textTransform: "uppercase"
              }}>
                ⚡ Smart Query Builder
              </Typography>
            </Stack>
            
            {isAuthenticated && (
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Button 
                  color="inherit" 
                  component={Link} 
                  to="/" 
                  sx={{ 
                    fontWeight: 700, 
                    fontSize: "0.85rem",
                    textTransform: "none", 
                    borderRadius: 2,
                    px: 2,
                    "&:hover": { bgcolor: "rgba(255,255,255,0.08)" } 
                  }}
                >
                  Dashboard
                </Button>
                <Button 
                  color="inherit" 
                  component={Link} 
                  to="/query-builder"
                  sx={{ 
                    fontWeight: 700, 
                    fontSize: "0.85rem",
                    textTransform: "none", 
                    borderRadius: 2,
                    px: 2,
                    "&:hover": { bgcolor: "rgba(255,255,255,0.08)" } 
                  }}
                >
                  Query Workspace
                </Button>
                <Button 
                  color="inherit" 
                  component={Link} 
                  to="/my-requests"
                  sx={{ 
                    fontWeight: 700, 
                    fontSize: "0.85rem",
                    textTransform: "none", 
                    borderRadius: 2,
                    px: 2,
                    "&:hover": { bgcolor: "rgba(255,255,255,0.08)" } 
                  }}
                >
                  My Requests
                </Button>
                {isAdmin && (
                  <Button 
                    color="inherit" 
                    component={Link} 
                    to="/admin-requests"
                    sx={{ 
                      fontWeight: 700, 
                      fontSize: "0.85rem",
                      textTransform: "none", 
                      borderRadius: 2,
                      px: 2,
                      color: "#f87171",
                      "&:hover": { bgcolor: "rgba(248,113,113,0.12)" } 
                    }}
                  >
                    Admin Requests
                  </Button>
                )}
                
                <Box sx={{ 
                  display: "flex", 
                  alignItems: "center", 
                  bgcolor: "rgba(255,255,255,0.06)", 
                  px: 2, 
                  py: 0.75, 
                  borderRadius: 2.5, 
                  gap: 1.5,
                  border: "1px solid rgba(255,255,255,0.05)"
                }}>
                  <Chip 
                    label={isAdmin ? "ADMIN" : "STANDARD"} 
                    size="small" 
                    color={isAdmin ? "error" : "primary"}
                    sx={{ 
                      fontWeight: 900, 
                      fontSize: "0.65rem",
                      height: 18,
                      borderRadius: 1
                    }}
                  />
                  <Typography variant="body2" sx={{ fontWeight: 600, color: "#cbd5e1" }}>
                    {user?.email}
                  </Typography>
                </Box>

                <Button 
                  variant="outlined" 
                  onClick={() => dispatch(logout())}
                  sx={{ 
                    textTransform: "none", 
                    borderColor: "rgba(255,255,255,0.2)",
                    borderRadius: 2,
                    color: "#fff",
                    fontWeight: 700,
                    px: 2,
                    "&:hover": {
                      borderColor: "#ef4444",
                      color: "#ef4444",
                      bgcolor: "rgba(239,68,68,0.08)"
                    }
                  }}
                >
                  Logout
                </Button>
              </Stack>
            )}
          </Toolbar>
        </Container>
      </AppBar>
      <Container maxWidth="xl" sx={{ py: 5 }}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
          <Route path="/query-builder" element={<PrivateRoute><QueryBuilderPage /></PrivateRoute>} />
          <Route path="/create-table" element={<PrivateRoute><CreateTablePage /></PrivateRoute>} />
          <Route path="/saved-queries" element={<PrivateRoute><SavedQueriesPage /></PrivateRoute>} />
          <Route path="/admin" element={<PrivateRoute><AdminPage /></PrivateRoute>} />
          <Route path="/my-requests" element={<PrivateRoute><MyRequestsPage /></PrivateRoute>} />
          <Route path="/admin-requests" element={<PrivateRoute><AdminRequestsPage /></PrivateRoute>} />
        </Routes>
      </Container>
    </Box>
  );
}


