import { useState } from "react";
import { Button, Card, CardContent, Stack, TextField, Typography } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import api from "../api/client";
import { setToken } from "../app/authSlice";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const submit = async () => {
    const { data } = await api.post("/auth/login", form);
    dispatch(setToken(data.token));
    navigate("/");
  };

  return (
    <Card sx={{ maxWidth: 480, mx: "auto" }}>
      <CardContent>
        <Stack spacing={2}>
          <Typography variant="h5">Login</Typography>
          <TextField label="Email" onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <TextField label="Password" type="password" onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <Button variant="contained" onClick={submit}>Sign in</Button>
          <Typography>New user? <Link to="/register">Register</Link></Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}
