import { useState } from "react";
import { Button, Card, CardContent, Stack, TextField, Typography } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/client";

export default function RegisterPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const submit = async () => {
    try {
      await api.post("/auth/register", form);
      setMessage("Registration successful! Redirecting to login...");
      setTimeout(() => navigate("/login"), 1200);
    } catch (err) {
      if (err.response?.data?.errors) {
        const fieldErrors = Object.entries(err.response.data.errors)
          .map(([field, msg]) => `${field}: ${msg}`)
          .join(", ");
        setMessage(`Validation failed: ${fieldErrors}`);
      } else {
        const errorMsg = err.response?.data?.message || err.response?.data?.error || "Registration failed. Please try again.";
        setMessage(errorMsg);
      }
    }
  };

  return (
    <Card sx={{ maxWidth: 480, mx: "auto" }}>
      <CardContent>
        <Stack spacing={2}>
          <Typography variant="h5">Register</Typography>
          <TextField label="Name" onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <TextField label="Email" onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <TextField label="Password" type="password" onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <Button variant="contained" onClick={submit}>Create Account</Button>
          {message && <Typography color="success.main">{message}</Typography>}
          <Typography>Already have an account? <Link to="/login">Login</Link></Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}
