import { useState } from "react";
import { Box, Button, Card, CardContent, Stack, TextField, Typography } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/client";

export default function RegisterPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const submit = async () => {
    try {
      setError("");
      setMessage("");
      await api.post("/auth/register", form);
      setMessage("Registration successful! Redirecting to login...");
      setTimeout(() => navigate("/login"), 1200);
    } catch (err) {
      if (err.response?.data) {
        const data = err.response.data;
        if (data.errors) {
          const fieldErrors = Object.entries(data.errors)
              .map(([field, msg]) => `${field}: ${msg}`)
              .join(", ");
          setError(`Validation failed: ${fieldErrors}`);
        } else if (data.message || data.error) {
          setError(data.message || data.error);
        } else {
          setError("Registration failed.");
        }
      } else {
        setError("Network error or registration failed.");
      }
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
          Create Account
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.85 }}>
          Join Smart Query Builder to manage databases visually
        </Typography>
      </Box>

      <CardContent sx={{ p: 4 }}>
        <Stack spacing={2.5}>
          <TextField 
            label="Full Name" 
            variant="outlined"
            onChange={(e) => setForm({ ...form, name: e.target.value })} 
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 3 } }}
          />
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
            Register Now
          </Button>

          {error && (
            <Typography color="error" textAlign="center" variant="body2" sx={{ fontWeight: 600 }}>
              ⚠️ {error}
            </Typography>
          )}
          {message && (
            <Typography color="success.main" textAlign="center" variant="body2" sx={{ fontWeight: 600 }}>
              ✅ {message}
            </Typography>
          )}

          <Typography variant="body2" textAlign="center" color="text.secondary" sx={{ mt: 1 }}>
            Already have an account?{" "}
            <Link to="/login" style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: 700 }}>
              Log In here
            </Link>
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}

