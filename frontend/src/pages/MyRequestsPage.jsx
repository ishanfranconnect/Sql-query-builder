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
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight="800" color="primary" gutterBottom>
        📑 My Modification Requests
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Track the status of your INSERT, UPDATE, and DELETE query requests submitted for admin approval.
      </Typography>

      {error && (
        <Paper sx={{ p: 2, bgcolor: "#ffebee", color: "#c62828", mb: 3, borderRadius: 2 }}>
          <Typography>Error: {error}</Typography>
        </Paper>
      )}

      <Paper sx={{ borderRadius: 3, boxShadow: 3, overflow: "hidden" }}>
        <Table>
          <TableHead sx={{ bgcolor: "#f8f9fa" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold" }}>ID</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>TARGET TABLE</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>ACTION TYPE</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>STATUS</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>SUBMITTED DATE</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>REVIEWER</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {requests.map((req) => (
              <TableRow key={req.id} hover>
                <TableCell>#{req.id}</TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontFamily: "monospace", bgcolor: "#e3f2fd", px: 1, borderRadius: 1, display: "inline-block" }}>
                    {req.targetTable}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip label={req.actionType} size="small" variant="outlined" />
                </TableCell>
                <TableCell>
                  <Chip 
                    label={req.status} 
                    color={getStatusColor(req.status)} 
                    variant={req.status === "PENDING" ? "outlined" : "filled"}
                    size="small" 
                  />
                </TableCell>
                <TableCell>{new Date(req.createdAt).toLocaleString()}</TableCell>
                <TableCell>
                  {req.reviewedBy ? (
                    <Typography variant="body2" color="success.main">{req.reviewedBy.email}</Typography>
                  ) : (
                    <Typography variant="body2" color="text.disabled">Pending Review</Typography>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {requests.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                  <Typography color="text.secondary">You haven't submitted any modification requests yet.</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>
    </Container>
  );
}
