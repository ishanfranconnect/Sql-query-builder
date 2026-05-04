import { useEffect, useState } from "react";
import { Container, Typography, Paper, Table, TableBody, TableCell, TableHead, TableRow, Chip } from "@mui/material";
import api from "../api/client";

export default function MyRequestsPage() {
  const [requests, setRequests] = useState([]);

  const [error, setError] = useState(null);

  useEffect(() => {
    api.get("/requests/my")
      .then((res) => setRequests(res.data))
      .catch((err) => setError(err.response?.data?.message || err.message));
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case "APPROVED": return "success";
      case "REJECTED": return "error";
      default: return "warning";
    }
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>My Modification Requests</Typography>
      {error && <Typography color="error" sx={{ mb: 2 }}>Error: {error}</Typography>}
      <Paper sx={{ p: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Table</TableCell>
              <TableCell>Action</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Reviewer</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {requests.map((req) => (
              <TableRow key={req.id}>
                <TableCell>{req.id}</TableCell>
                <TableCell>{req.targetTable}</TableCell>
                <TableCell>{req.actionType}</TableCell>
                <TableCell>
                  <Chip label={req.status} color={getStatusColor(req.status)} size="small" />
                </TableCell>
                <TableCell>{new Date(req.createdAt).toLocaleString()}</TableCell>
                <TableCell>{req.reviewedBy ? req.reviewedBy.email : "N/A"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Container>
  );
}
