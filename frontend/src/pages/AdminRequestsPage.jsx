import { useEffect, useState } from "react";
import { Container, Typography, Paper, Table, TableBody, TableCell, TableHead, TableRow, Chip, Button, Stack, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import api from "../api/client";

export default function AdminRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = () => {
    api.get("/requests")
      .then((res) => setRequests(res.data))
      .catch((err) => setError(err.response?.data?.message || err.message));
  };

  const handleApprove = async (id) => {
    try {
      await api.post(`/requests/${id}/approve`);
      fetchRequests();
      setSelectedRequest(null);
    } catch (err) {
      alert("Failed to approve: " + (err.response?.data?.message || err.message));
    }
  };

  const handleReject = async (id) => {
    try {
      await api.post(`/requests/${id}/reject`);
      fetchRequests();
      setSelectedRequest(null);
    } catch (err) {
      alert("Failed to reject: " + (err.response?.data?.message || err.message));
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "APPROVED": return "success";
      case "REJECTED": return "error";
      default: return "warning";
    }
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>Admin Approval Workflow</Typography>
      {error && <Typography color="error" sx={{ mb: 2 }}>Error: {error}</Typography>}
      <Paper sx={{ p: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>User</TableCell>
              <TableCell>Table</TableCell>
              <TableCell>Action</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {requests.map((req) => (
              <TableRow key={req.id}>
                <TableCell>{req.id}</TableCell>
                <TableCell>{req.user.email}</TableCell>
                <TableCell>{req.targetTable}</TableCell>
                <TableCell>{req.actionType}</TableCell>
                <TableCell>
                  <Chip label={req.status} color={getStatusColor(req.status)} size="small" />
                </TableCell>
                <TableCell>{new Date(req.createdAt).toLocaleString()}</TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1}>
                    <Button size="small" variant="outlined" onClick={() => setSelectedRequest(req)}>View</Button>
                    {req.status === "PENDING" && (
                      <>
                        <Button size="small" color="success" variant="contained" onClick={() => handleApprove(req.id)}>Approve</Button>
                        <Button size="small" color="error" variant="contained" onClick={() => handleReject(req.id)}>Reject</Button>
                      </>
                    )}
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      <Dialog open={!!selectedRequest} onClose={() => setSelectedRequest(null)} maxWidth="md" fullWidth>
        <DialogTitle>Request Details</DialogTitle>
        <DialogContent>
          {selectedRequest && (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Typography><strong>User:</strong> {selectedRequest.user.email}</Typography>
              <Typography><strong>Action:</strong> {selectedRequest.actionType}</Typography>
              <Typography><strong>Table:</strong> {selectedRequest.targetTable}</Typography>
              <Typography><strong>Status:</strong> {selectedRequest.status}</Typography>
              <Paper variant="outlined" sx={{ p: 2, bgcolor: "#f5f5f5" }}>
                <Typography variant="subtitle2" gutterBottom>Payload:</Typography>
                <pre style={{ margin: 0, overflowX: "auto" }}>{JSON.stringify(JSON.parse(selectedRequest.payload), null, 2)}</pre>
              </Paper>
              {selectedRequest.executionResult && (
                <Paper variant="outlined" sx={{ p: 2, bgcolor: "#e8f5e9" }}>
                  <Typography variant="subtitle2" gutterBottom>Execution Result:</Typography>
                  <pre style={{ margin: 0, overflowX: "auto" }}>{JSON.stringify(JSON.parse(selectedRequest.executionResult), null, 2)}</pre>
                </Paper>
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedRequest(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
