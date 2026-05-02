import { useState } from "react";
import { Button, Card, CardContent, Stack, TextField, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import api from "../api/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    setMessage("");
    setError("");
    try {
      const { data } = await api.post("/auth/forgot-password", { email });
      setMessage(data.message);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card sx={{ maxWidth: 480, mx: "auto" }}>
      <CardContent>
        <Stack spacing={3}>
          <Typography variant="h5" fontWeight="bold">Forgot Password</Typography>
          <Typography variant="body2" color="text.secondary">
            Enter your email address and we'll send you a link to reset your password.
          </Typography>
          
          <TextField 
            fullWidth
            label="Email Address" 
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)} 
          />
          
          <Button 
            fullWidth
            variant="contained" 
            size="large"
            onClick={submit}
            disabled={loading || !email}
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </Button>

          {message && <Typography color="success.main" variant="body2">{message}</Typography>}
          {error && <Typography color="error" variant="body2">{error}</Typography>}
          
          <Typography variant="body2" textAlign="center">
            Remember your password? <Link to="/login" style={{ color: '#1976d2', textDecoration: 'none', fontWeight: 'bold' }}>Back to Login</Link>
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}
