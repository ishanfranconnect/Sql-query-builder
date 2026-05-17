import { useState } from "react";
import { Box, Button, Card, CardContent, Stack, TextField, Typography } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import api from "../api/client";
import { setCredentials } from "../app/authSlice";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const submit = async () => {
    try {
      const { data } = await api.post("/auth/login", form);
      dispatch(setCredentials(data));
      navigate("/");
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.response?.data?.error || "Login failed. Please check your credentials.";
      setMessage(errorMsg);
    }
  };

  return (
    <Card sx={{ 
      maxWidth: 460, 
      mx: "auto", 
      mt: 6,
      boxShadow: "0 15px 50px rgba(0,0,0,0.08)", 
      borderRadius: 5,
      border: "1px solid rgba(0,0,0,0.05)",
      overflow: "hidden"
    }}>
      {/* Brand Header */}
      <Box sx={{ 
        py: 4, 
        px: 3, 
        background: "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)", 
        color: "#fff",
        textAlign: "center"
      }}>
        <Typography variant="h4" fontWeight="900" sx={{ mb: 1 }}>
          Smart Query Builder
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.85 }}>
          Sign in to access your SQL dashboards
        </Typography>
      </Box>

      <CardContent sx={{ p: 4 }}>
        <Stack spacing={2.5}>
          <TextField 
            label="Email Address" 
            variant="outlined"
            onChange={(e) => setForm({ ...form, email: e.target.value })} 
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 3 } }}
          />
          <TextField 
            label="Password" 
            type="password" 
            variant="outlined"
            onChange={(e) => setForm({ ...form, password: e.target.value })} 
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 3 } }}
          />
          
          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <Link to="/forgot-password" style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: 600, fontSize: '0.875rem' }}>
              Forgot Password?
            </Link>
          </Box>

          <Button 
            variant="contained" 
            onClick={submit}
            sx={{ 
              py: 1.5, 
              borderRadius: 3, 
              fontWeight: "bold", 
              textTransform: "none", 
              fontSize: "1rem",
              background: "linear-gradient(90deg, #1e3a8a, #3b82f6)",
              boxShadow: "0 4px 15px rgba(59, 130, 246, 0.25)",
              "&:hover": {
                background: "linear-gradient(90deg, #1e3a8a, #1d4ed8)"
              }
            }}
          >
            Sign In
          </Button>

          {message && (
            <Typography color="error" textAlign="center" variant="body2" sx={{ fontWeight: 600 }}>
              ⚠️ {message}
            </Typography>
          )}

          <Typography variant="body2" textAlign="center" color="text.secondary" sx={{ mt: 1 }}>
            New user?{" "}
            <Link to="/register" style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: 700 }}>
              Create an Account
            </Link>
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}
