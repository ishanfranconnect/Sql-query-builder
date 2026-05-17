import { useEffect } from "react";
import { Box, Button, Card, CardContent, Grid, Stack, Typography, Chip } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { setSavedQueries } from "../app/querySlice";
import api from "../api/client";

export default function SavedQueriesPage() {
  const dispatch = useDispatch();
  const saved = useSelector((state) => state.query.saved);

  const load = async () => {
    const { data } = await api.get("/queries");
    dispatch(setSavedQueries(data));
  };

  const remove = async (id) => {
    if (window.confirm("Are you sure you want to delete this saved query template?")) {
      await api.delete(`/queries/${id}`);
      await load();
    }
  };

  useEffect(() => { load(); }, []);

  const getQueryTypeColor = (sql) => {
    const s = sql?.trim().toUpperCase();
    if (s?.startsWith("SELECT")) return "info";
    if (s?.startsWith("INSERT")) return "success";
    if (s?.startsWith("UPDATE")) return "warning";
    if (s?.startsWith("DELETE")) return "error";
    return "default";
  };

  return (
    <Stack spacing={4} sx={{ pb: 6 }}>
      {/* Title Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Box>
          <Typography variant="h4" fontWeight="900" sx={{ background: "linear-gradient(90deg, #10b981, #059669)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", mb: 0.5 }}>
            💾 Saved Query Library
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Access, re-run, and organize your saved visual query templates.
          </Typography>
        </Box>
        <Button component={Link} to="/" variant="outlined" sx={{ borderRadius: 3, textTransform: "none", fontWeight: "bold" }}>
          ← Back to Dashboard
        </Button>
      </Box>

      {saved.length === 0 ? (
        <Card sx={{ p: 5, textAlign: "center", borderRadius: 4, boxShadow: "0 10px 30px rgba(0,0,0,0.03)" }}>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 1, fontWeight: "bold" }}>
            Your Library is Empty
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Create and save queries in the Query Builder workspace to see them here!
          </Typography>
          <Button component={Link} to="/query-builder" variant="contained" sx={{ borderRadius: 3, px: 4, py: 1.25, fontWeight: "bold", textTransform: "none", bgcolor: "#10b981", "&:hover": { bgcolor: "#059669" } }}>
            Build a Query
          </Button>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {saved.map((q) => {
            const queryType = q.query?.type || "SELECT";
            return (
              <Grid item xs={12} md={6} key={q.id}>
                <Card sx={{ 
                  height: "100%",
                  boxShadow: "0 8px 30px rgba(0,0,0,0.04)", 
                  borderRadius: 4, 
                  border: "1px solid rgba(0,0,0,0.05)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  transition: "transform 0.2s",
                  "&:hover": {
                    transform: "translateY(-4px)"
                  }
                }}>
                  <CardContent sx={{ p: 3 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                      <Typography variant="h6" fontWeight="800" color="text.primary">
                        {q.name}
                      </Typography>
                      <Chip 
                        label={queryType} 
                        color={getQueryTypeColor(q.generatedSql)} 
                        size="small" 
                        sx={{ fontWeight: "bold", fontSize: "0.7rem", borderRadius: 1.5 }}
                      />
                    </Stack>
                    
                    <Box sx={{ 
                      p: 2, 
                      bgcolor: "#0b0f19", 
                      borderRadius: 3, 
                      fontFamily: "monospace",
                      fontSize: "0.825rem",
                      color: "#38bdf8",
                      overflowX: "auto",
                      whiteSpace: "pre-wrap",
                      maxHeight: 150,
                      mb: 2
                    }}>
                      {q.generatedSql}
                    </Box>
                  </CardContent>

                  <Box sx={{ px: 3, pb: 3, pt: 0, display: "flex", gap: 1.5, justifyContent: "flex-end" }}>
                    <Button 
                      component={Link}
                      to="/query-builder"
                      variant="outlined" 
                      size="small"
                      sx={{ borderRadius: 2, textTransform: "none", fontWeight: "bold" }}
                    >
                      Open in Builder
                    </Button>
                    <Button 
                      color="error" 
                      onClick={() => remove(q.id)}
                      size="small"
                      sx={{ fontWeight: "bold", textTransform: "none" }}
                    >
                      🗑️ Delete
                    </Button>
                  </Box>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Stack>
  );
}

