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
    api.get("/admin/pending-queries")
      .then((res) => setRequests(res.data))
      .catch((err) => setError(err.response?.data?.message || err.message));
  };

  const handleApprove = async (id) => {
    try {
      await api.post(`/admin/approve/${id}`);
      fetchRequests();
      setSelectedRequest(null);
    } catch (err) {
      alert("Failed to approve: " + (err.response?.data?.message || err.message));
    }
  };

  const handleReject = async (id) => {
    try {
      await api.post(`/admin/reject/${id}`);
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
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight="800" color="primary" gutterBottom>
        🛡️ Admin Approval Workflow
      </Typography>
      {error && <Typography color="error" sx={{ mb: 2 }}>Error: {error}</Typography>}
      <Paper sx={{ p: 2, borderRadius: 3, boxShadow: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>User</TableCell>
              <TableCell>Table</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Submitted At</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {requests.map((req) => (
              <TableRow key={req.id} hover>
                <TableCell>#{req.id}</TableCell>
                <TableCell>{req.user.email}</TableCell>
                <TableCell>{req.targetTable}</TableCell>
                <TableCell>
                  <Chip label={req.actionType} size="small" variant="outlined" color="primary" />
                </TableCell>
                <TableCell>
                  <Chip label={req.status} color={getStatusColor(req.status)} size="small" />
                </TableCell>
                <TableCell>{new Date(req.createdAt).toLocaleString()}</TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1}>
                    <Button size="small" variant="outlined" onClick={() => setSelectedRequest(req)}>Review</Button>
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
            {requests.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center">No pending requests found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>

      <Dialog open={!!selectedRequest} onClose={() => setSelectedRequest(null)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: "#f5f5f5", borderBottom: "1px solid #ddd" }}>Request Details: #{selectedRequest?.id}</DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          {selectedRequest && (
            <Stack spacing={3} sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">SUBMITTED BY</Typography>
                  <Typography fontWeight="bold">{selectedRequest.user.email}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">OPERATION</Typography>
                  <Typography fontWeight="bold">{selectedRequest.actionType} on {selectedRequest.targetTable}</Typography>
                </Grid>
              </Grid>

              <Box>
                <Typography variant="caption" color="text.secondary">SQL QUERY PREVIEW</Typography>
                <Paper variant="outlined" sx={{ p: 2, bgcolor: "#f8f9fa", borderRadius: 2, mt: 0.5 }}>
                  <pre style={{ margin: 0, overflowX: "auto", color: "#d32f2f", whiteSpace: "pre-wrap" }}>
                    {selectedRequest.queryText}
                  </pre>
                </Paper>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">FULL PAYLOAD (JSON)</Typography>
                <Paper variant="outlined" sx={{ p: 2, bgcolor: "#333", borderRadius: 2, mt: 0.5 }}>
                  <pre style={{ margin: 0, overflowX: "auto", color: "#00e676", fontSize: "12px" }}>
                    {JSON.stringify(JSON.parse(selectedRequest.payload), null, 2)}
                  </pre>
                </Paper>
              </Box>

              {selectedRequest.executionResult && (
                <Box>
                  <Typography variant="caption" color="text.secondary">EXECUTION LOGS</Typography>
                  <Paper variant="outlined" sx={{ p: 2, bgcolor: "#e8f5e9", borderRadius: 2, border: "1px solid #4caf50", mt: 0.5 }}>
                    <pre style={{ margin: 0, overflowX: "auto", color: "#2e7d32" }}>
                      {JSON.stringify(JSON.parse(selectedRequest.executionResult), null, 2)}
                    </pre>
                  </Paper>
                </Box>
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: "1px solid #ddd" }}>
          <Button onClick={() => setSelectedRequest(null)}>Cancel</Button>
          {selectedRequest?.status === "PENDING" && (
            <>
              <Button color="error" variant="contained" onClick={() => handleReject(selectedRequest.id)}>Reject Request</Button>
              <Button color="success" variant="contained" onClick={() => handleApprove(selectedRequest.id)}>Approve & Execute</Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    </Container>
  );
}
