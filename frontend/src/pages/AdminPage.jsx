import { useEffect, useState } from "react";
import { Card, CardContent, Stack, Typography } from "@mui/material";
import api from "../api/client";

export default function AdminPage() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    api.get("/admin/users").then((res) => setUsers(res.data)).catch(() => setUsers([]));
  }, []);

  return (
    <Card>
      <CardContent>
        <Typography variant="h4" gutterBottom>Admin Panel</Typography>
        <Stack spacing={1}>
          {users.map((u) => (
            <Typography key={u.id}>{u.name} - {u.email}</Typography>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}
