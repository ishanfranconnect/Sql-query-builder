import { useEffect, useState } from "react";
import { 
  Box, 
  Container, 
  Typography, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer,
  TableHead, 
  TableRow, 
  Chip, 
  Button, 
  Stack, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  Grid
} from "@mui/material";
import { Link } from "react-router-dom";
import api from "../api/client";

export default function MyRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [error, setError] = useState(null);

  const fetchRequests = () => {
    api.get("/requests/my")
      .then((res) => setRequests(res.data))
      .catch((err) => setError(err.response?.data?.message || err.message));
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case "APPROVED": return "success";
      case "REJECTED": return "error";
      default: return "warning";
    }
  };

  const getActionColor = (action) => {
    switch (action) {
      case "INSERT": return "success";
      case "UPDATE": return "warning";
      case "DELETE": return "error";
      default: return "info";
    }
  };

  return (
    <Stack spacing={4} sx={{ pb: 6 }}>
      {/* Title Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Box>
          <Typography variant="h4" fontWeight="900" sx={{ background: "linear-gradient(90deg, #f59e0b, #d97706)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", mb: 0.5 }}>
            📑 My Modification Requests
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Track and inspect the status of your INSERT, UPDATE, and DELETE query requests.
          </Typography>
        </Box>
        <Button component={Link} to="/" variant="outlined" sx={{ borderRadius: 3, textTransform: "none", fontWeight: "bold" }}>
          ← Back to Dashboard
        </Button>
      </Box>

      {error && (
        <Paper sx={{ p: 2, bgcolor: "#ffebee", color: "#c62828", borderRadius: 3, border: "1px solid #ef9a9a" }}>
          <Typography variant="body2" fontWeight="bold">Error: {error}</Typography>
        </Paper>
      )}

      <TableContainer component={Paper} sx={{ 
        boxShadow: "0 10px 40px rgba(0,0,0,0.04)", 
        borderRadius: 4, 
        border: "1px solid rgba(0,0,0,0.05)",
        overflow: "hidden"
      }}>
        <Table>
          <TableHead sx={{ bgcolor: "#f8fafc" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: "800", color: "text.secondary", fontSize: "0.85rem" }}>REQUEST ID</TableCell>
              <TableCell sx={{ fontWeight: "800", color: "text.secondary", fontSize: "0.85rem" }}>TARGET TABLE</TableCell>
              <TableCell sx={{ fontWeight: "800", color: "text.secondary", fontSize: "0.85rem" }}>ACTION TYPE</TableCell>
              <TableCell sx={{ fontWeight: "800", color: "text.secondary", fontSize: "0.85rem" }}>STATUS</TableCell>
              <TableCell sx={{ fontWeight: "800", color: "text.secondary", fontSize: "0.85rem" }}>SUBMITTED DATE</TableCell>
              <TableCell sx={{ fontWeight: "800", color: "text.secondary", fontSize: "0.85rem" }}>REVIEWER / NOTES</TableCell>
              <TableCell align="right" sx={{ fontWeight: "800", color: "text.secondary", fontSize: "0.85rem" }}>DETAILS</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {requests.map((req) => (
              <TableRow key={req.id} hover sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                <TableCell fontWeight="bold">#{req.id}</TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontFamily: "monospace", fontWeight: 700, color: "#1e3a8a", bgcolor: "#f0f4f8", px: 1.25, py: 0.5, borderRadius: 1.5, display: "inline-block" }}>
                    {req.targetTable}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip 
                    label={req.actionType} 
                    color={getActionColor(req.actionType)} 
                    size="small" 
                    sx={{ fontWeight: "bold", fontSize: "0.7rem", borderRadius: 1.5 }} 
                  />
                </TableCell>
                <TableCell>
                  <Chip 
                    label={req.status} 
                    color={getStatusColor(req.status)} 
                    variant={req.status === "PENDING" ? "outlined" : "filled"}
                    size="small" 
                    sx={{ fontWeight: "bold", fontSize: "0.7rem", borderRadius: 1.5 }}
                  />
                </TableCell>
                <TableCell sx={{ color: "text.secondary", fontSize: "0.875rem" }}>
                  {new Date(req.createdAt).toLocaleString()}
                </TableCell>
                <TableCell>
                  {req.reviewedBy ? (
                    <Typography variant="body2" color="success.main" fontWeight="600">
                      Approved by {req.reviewedBy.email}
                    </Typography>
                  ) : (
                    <Typography variant="body2" color="text.disabled" sx={{ fontStyle: "italic" }}>
                      Pending Decision
                    </Typography>
                  )}
                </TableCell>
                <TableCell align="right">
                  <Button 
                    size="small" 
                    variant="outlined" 
                    onClick={() => setSelectedRequest(req)}
                    sx={{ borderRadius: 2, textTransform: "none", fontWeight: "bold" }}
                  >
                    View SQL
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {requests.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                  <Typography color="text.secondary" fontWeight="600" sx={{ mb: 1 }}>
                    No Modification Requests
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Standard users cannot run UPDATE, INSERT, or DELETE directly. Build those actions and submit them for review!
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Details Dialog */}
      <Dialog 
        open={!!selectedRequest} 
        onClose={() => setSelectedRequest(null)} 
        maxWidth="md" 
        fullWidth
        PaperProps={{ sx: { borderRadius: 4, p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: "bold", borderBottom: "1px solid #e2e8f0", pb: 2 }}>
          Modification Request Details: #{selectedRequest?.id}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {selectedRequest && (
            <Stack spacing={3} sx={{ mt: 1 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <Typography variant="caption" color="text.secondary" fontWeight="700">TARGET TABLE</Typography>
                  <Typography fontWeight="800" color="primary">{selectedRequest.targetTable}</Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="caption" color="text.secondary" fontWeight="700">ACTION TYPE</Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <Chip label={selectedRequest.actionType} color={getActionColor(selectedRequest.actionType)} size="small" sx={{ fontWeight: "bold" }} />
                  </Box>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="caption" color="text.secondary" fontWeight="700">DECISION STATUS</Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <Chip label={selectedRequest.status} color={getStatusColor(selectedRequest.status)} size="small" sx={{ fontWeight: "bold" }} />
                  </Box>
                </Grid>
              </Grid>

              <Box>
                <Typography variant="subtitle2" fontWeight="800" color="text.secondary" sx={{ mb: 1 }}>
                  💻 GENERATED SQL QUERY
                </Typography>
                <Box sx={{ 
                  p: 2.5, 
                  bgcolor: "#0b0f19", 
                  borderRadius: 3, 
                  fontFamily: "monospace",
                  color: "#f87171",
                  overflowX: "auto",
                  whiteSpace: "pre-wrap"
                }}>
                  {selectedRequest.queryText}
                </Box>
              </Box>

              {selectedRequest.payload && (
                <Box>
                  <Typography variant="subtitle2" fontWeight="800" color="text.secondary" sx={{ mb: 1 }}>
                    📦 REQUEST PAYLOAD PARAMS (JSON)
                  </Typography>
                  <Box sx={{ 
                    p: 2.5, 
                    bgcolor: "#1e293b", 
                    borderRadius: 3, 
                    fontFamily: "monospace",
                    color: "#38bdf8",
                    fontSize: "0.85rem",
                    overflowX: "auto"
                  }}>
                    <pre style={{ margin: 0 }}>
                      {JSON.stringify(JSON.parse(selectedRequest.payload), null, 2)}
                    </pre>
                  </Box>
                </Box>
              )}

              {selectedRequest.executionResult && (
                <Box>
                  <Typography variant="subtitle2" fontWeight="800" color="text.secondary" sx={{ mb: 1 }}>
                    ⚙️ DATABASE EXECUTION LOGS
                  </Typography>
                  <Box sx={{ 
                    p: 2.5, 
                    bgcolor: "#f0fdf4", 
                    borderRadius: 3, 
                    border: "1px solid #bbf7d0",
                    fontFamily: "monospace",
                    color: "#166534",
                    fontSize: "0.85rem",
                    overflowX: "auto"
                  }}>
                    <pre style={{ margin: 0 }}>
                      {JSON.stringify(JSON.parse(selectedRequest.executionResult), null, 2)}
                    </pre>
                  </Box>
                </Box>
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2.5, borderTop: "1px solid #e2e8f0" }}>
          <Button onClick={() => setSelectedRequest(null)} variant="contained" sx={{ borderRadius: 2.5, px: 3, fontWeight: "bold" }}>
            Close Details
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}

