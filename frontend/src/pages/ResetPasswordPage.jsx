import { useState } from "react";
import { Button, Card, CardContent, Stack, TextField, Typography } from "@mui/material";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../api/client";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!token) {
      setError("Invalid or missing reset token");
      return;
    }

    setLoading(true);
    setMessage("");
    setError("");
    
    try {
      const { data } = await api.post("/auth/reset-password", { 
        token, 
        password: form.password 
      });
      setMessage(data.message);
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Reset failed. The token might be expired.");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <Card sx={{ maxWidth: 480, mx: "auto" }}>
        <CardContent>
          <Typography color="error">Invalid reset link. Please request a new one.</Typography>
          <Button onClick={() => navigate("/forgot-password")}>Go back</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ maxWidth: 480, mx: "auto" }}>
      <CardContent>
        <Stack spacing={3}>
          <Typography variant="h5" fontWeight="bold">Reset Password</Typography>
          <Typography variant="body2" color="text.secondary">
            Please enter your new password below.
          </Typography>

          <TextField 
            fullWidth
            label="New Password" 
            type="password" 
            onChange={(e) => setForm({ ...form, password: e.target.value })} 
          />
          <TextField 
            fullWidth
            label="Confirm Password" 
            type="password" 
            onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} 
          />

          <Button 
            fullWidth
            variant="contained" 
            size="large"
            onClick={submit}
            disabled={loading || !form.password || !form.confirmPassword}
          >
            {loading ? "Resetting..." : "Reset Password"}
          </Button>

          {message && <Typography color="success.main" variant="body2">{message}. Redirecting to login...</Typography>}
          {error && <Typography color="error" variant="body2">{error}</Typography>}
        </Stack>
      </CardContent>
    </Card>
  );
}
