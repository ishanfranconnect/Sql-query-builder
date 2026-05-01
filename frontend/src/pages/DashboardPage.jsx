import { Button, Card, CardContent, Stack, Typography } from "@mui/material";
import { Link } from "react-router-dom";

export default function DashboardPage() {
  return (
    <Card>
      <CardContent>
        <Typography variant="h4" gutterBottom>Dashboard</Typography>
        <Stack direction="row" spacing={2}>
          <Button component={Link} to="/query-builder" variant="contained">Query Builder</Button>
          <Button component={Link} to="/saved-queries" variant="outlined">Saved Queries</Button>
          <Button component={Link} to="/admin" variant="outlined">Admin Panel</Button>
        </Stack>
      </CardContent>
    </Card>
  );
}
