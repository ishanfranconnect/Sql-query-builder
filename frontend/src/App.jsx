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
    <Box>
      <AppBar position="static" sx={{ background: 'linear-gradient(90deg, #1976d2 0%, #42a5f5 100%)' }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 'bold', letterSpacing: 1 }}>
            SMART QUERY BUILDER
          </Typography>
          {isAuthenticated && (
            <Stack direction="row" spacing={2} alignItems="center">
              <Button color="inherit" component={Link} to="/">Dashboard</Button>
              <Button color="inherit" component={Link} to="/query-builder">Builder</Button>
              <Button color="inherit" component={Link} to="/my-requests">My Requests</Button>
              {isAdmin && <Button color="inherit" component={Link} to="/admin-requests">Admin Requests</Button>}
              
              <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: 'rgba(255,255,255,0.1)', px: 2, py: 0.5, borderRadius: 2, gap: 1.5 }}>
                <Chip 
                  label={isAdmin ? "Admin" : "User"} 
                  size="small" 
                  color={isAdmin ? "secondary" : "default"}
                  sx={{ fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.7rem' }}
                />
                <Typography variant="body2" sx={{ fontWeight: 500, color: '#fff' }}>
                  {user?.email}
                </Typography>
              </Box>

              <Button 
                variant="outlined" 
                color="inherit" 
                onClick={() => dispatch(logout())}
                sx={{ ml: 1, textTransform: 'none', borderColor: 'rgba(255,255,255,0.5)' }}
              >
                Logout
              </Button>
            </Stack>
          )}
        </Toolbar>
      </AppBar>
      <Container sx={{ py: 4 }}>
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
