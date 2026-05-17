import { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  FormControlLabel,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Typography,
  Chip,
} from "@mui/material";
import { Link } from "react-router-dom";
import api from "../api/client";

const emptyColumn = () => ({
  columnName: "",
  dataType: "INT",
  notNull: false,
  primaryKey: false,
  unique: false,
  autoIncrement: false,
  defaultValue: "",
});

const DATA_TYPE_PRESETS = [
  "INT",
  "BIGINT",
  "VARCHAR(255)",
  "TEXT",
  "BOOLEAN",
  "DATE",
  "DATETIME",
  "TIMESTAMP",
  "DECIMAL(10,2)",
  "DOUBLE",
];

export default function CreateTablePage() {
  const [tableName, setTableName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [columns, setColumns] = useState([emptyColumn()]);
  const [presetTypes, setPresetTypes] = useState([""]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const updateColumn = (idx, field, value) => {
    const next = [...columns];
    next[idx] = { ...next[idx], [field]: value };
    setColumns(next);
  };

  const addColumn = () => {
    setColumns([...columns, emptyColumn()]);
    setPresetTypes([...presetTypes, ""]);
  };

  const removeColumn = (idx) => {
    if (columns.length <= 1) return;
    setColumns(columns.filter((_, i) => i !== idx));
    setPresetTypes(presetTypes.filter((_, i) => i !== idx));
  };

  const applyPreset = (idx, preset) => {
    const nextPreset = [...presetTypes];
    nextPreset[idx] = preset;
    setPresetTypes(nextPreset);
    if (preset && preset !== "custom") {
      updateColumn(idx, "dataType", preset);
    }
  };

  const submit = async () => {
    setLoading(true);
    setResult(null);
    try {
      const payload = {
        tableName: tableName.trim(),
        displayName: displayName.trim() || undefined,
        columns: columns.map((c) => ({
          columnName: c.columnName.trim(),
          dataType: c.dataType.trim(),
          notNull: Boolean(c.notNull),
          primaryKey: Boolean(c.primaryKey),
          unique: Boolean(c.unique),
          autoIncrement: Boolean(c.autoIncrement),
          defaultValue: c.defaultValue?.trim() ? c.defaultValue.trim() : null,
        })),
      };
      const { data } = await api.post("/schema/tables", payload);
      setResult(data);
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        (typeof err.response?.data === "object"
          ? JSON.stringify(err.response?.data)
          : null) ||
        err.message;
      setResult({ error: true, message: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack spacing={4} sx={{ pb: 6 }}>
      {/* Title Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Box>
          <Typography variant="h4" fontWeight="900" sx={{ background: "linear-gradient(90deg, #06b6d4, #3b82f6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", mb: 0.5 }}>
            🛠️ Visual Table Creator
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Visually structure MySQL database tables with keys, types, and constraints without writing SQL.
          </Typography>
        </Box>
        <Button component={Link} to="/" variant="outlined" sx={{ borderRadius: 3, textTransform: "none", fontWeight: "bold" }}>
          ← Back to Dashboard
        </Button>
      </Box>

      {/* Main Workspace Card */}
      <Card sx={{ 
        boxShadow: "0 10px 40px rgba(0,0,0,0.04)", 
        borderRadius: 5, 
        border: "1px solid rgba(0,0,0,0.06)",
        overflow: "visible" 
      }}>
        <CardContent sx={{ p: { xs: 3, md: 5 } }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                label="Table System Name"
                value={tableName}
                onChange={(e) => setTableName(e.target.value)}
                placeholder="e.g. products"
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 3 } }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Display Friendly Name (optional)"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g. Products Inventory"
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 3 } }}
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 5, mb: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="h6" fontWeight="800" color="text.secondary" sx={{ letterSpacing: 0.5, textTransform: "uppercase", fontSize: "0.9rem" }}>
              📋 Define Columns Structure
            </Typography>
            <Button variant="outlined" onClick={addColumn} sx={{ borderRadius: 2.5, textTransform: "none", fontWeight: "bold" }}>
              + Add Column
            </Button>
          </Box>

          <Stack spacing={3.5} sx={{ mb: 4 }}>
            {columns.map((col, idx) => (
              <Box
                key={idx}
                sx={{
                  p: 3,
                  bgcolor: "#f8fafc",
                  borderRadius: 4,
                  border: "1px solid #e2e8f0",
                  position: "relative",
                  transition: "all 0.2s",
                  "&:hover": {
                    borderColor: "#cbd5e1",
                    boxShadow: "0 4px 15px rgba(0,0,0,0.02)"
                  }
                }}
              >
                <Grid container spacing={2.5} alignItems="center">
                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Column Name"
                      value={col.columnName}
                      onChange={(e) => updateColumn(idx, "columnName", e.target.value)}
                      placeholder="e.g. product_id"
                      sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2.5, bgcolor: "#fff" } }}
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <TextField
                      select
                      fullWidth
                      size="small"
                      label="Data Type Preset"
                      value={presetTypes[idx] === undefined ? "" : presetTypes[idx]}
                      onChange={(e) => applyPreset(idx, e.target.value)}
                      sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2.5, bgcolor: "#fff" } }}
                    >
                      <MenuItem value="">
                        <em>Manual Specification</em>
                      </MenuItem>
                      {DATA_TYPE_PRESETS.map((p) => (
                        <MenuItem key={p} value={p}>
                          {p}
                        </MenuItem>
                      ))}
                      <MenuItem value="custom">Custom Type...</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      size="small"
                      label="SQL Type Definition"
                      value={col.dataType}
                      onChange={(e) => updateColumn(idx, "dataType", e.target.value)}
                      placeholder="INT, VARCHAR(100), etc."
                      sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2.5, bgcolor: "#fff" } }}
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Default Value"
                      value={col.defaultValue}
                      onChange={(e) => updateColumn(idx, "defaultValue", e.target.value)}
                      placeholder="e.g. NULL or 0"
                      sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2.5, bgcolor: "#fff" } }}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Stack direction="row" flexWrap="wrap" gap={2} alignItems="center" justifyContent="space-between">
                      <Stack direction="row" flexWrap="wrap" gap={2}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={col.notNull}
                              onChange={(e) => updateColumn(idx, "notNull", e.target.checked)}
                            />
                          }
                          label={<Typography variant="body2" fontWeight="600">NOT NULL</Typography>}
                        />
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={col.primaryKey}
                              onChange={(e) => updateColumn(idx, "primaryKey", e.target.checked)}
                            />
                          }
                          label={<Typography variant="body2" fontWeight="600">PRIMARY KEY</Typography>}
                        />
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={col.unique}
                              onChange={(e) => updateColumn(idx, "unique", e.target.checked)}
                              disabled={col.primaryKey}
                            />
                          }
                          label={<Typography variant="body2" fontWeight="600">UNIQUE</Typography>}
                        />
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={col.autoIncrement}
                              onChange={(e) => updateColumn(idx, "autoIncrement", e.target.checked)}
                            />
                          }
                          label={<Typography variant="body2" fontWeight="600">AUTO_INCREMENT</Typography>}
                        />
                      </Stack>
                      <Button
                        size="small"
                        color="error"
                        onClick={() => removeColumn(idx)}
                        disabled={columns.length <= 1}
                        sx={{ fontWeight: "bold", textTransform: "none" }}
                      >
                        🗑️ Delete Column
                      </Button>
                    </Stack>
                  </Grid>
                </Grid>
              </Box>
            ))}
          </Stack>

          <Stack direction="row" spacing={2} sx={{ mt: 5, justifyContent: "center" }}>
            <Button
              variant="contained"
              size="large"
              onClick={submit}
              disabled={loading}
              sx={{ 
                py: 1.75, 
                px: 6, 
                borderRadius: 3.5, 
                fontWeight: "900",
                textTransform: "none",
                fontSize: "1.05rem",
                letterSpacing: 0.5,
                background: "linear-gradient(90deg, #06b6d4, #3b82f6)",
                boxShadow: "0 8px 25px rgba(59, 130, 246, 0.25)",
                "&:hover": {
                  background: "linear-gradient(90deg, #0891b2, #2563eb)",
                  boxShadow: "0 12px 30px rgba(59, 130, 246, 0.35)"
                }
              }}
            >
              {loading ? "Creating schema..." : "⚡ CREATE TABLE SCHEMA"}
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* Terminal Output for Create Table Results */}
      <Card sx={{ 
        boxShadow: "0 12px 40px rgba(0,0,0,0.08)", 
        borderRadius: 5, 
        overflow: "hidden", 
        border: "1px solid #1e293b" 
      }}>
        {/* Terminal Header */}
        <Box sx={{ 
          px: 3, 
          py: 2, 
          bgcolor: "#0f172a", 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "space-between",
          borderBottom: "1px solid #1e293b"
        }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Box sx={{ width: 12, height: 12, borderRadius: "50%", bgcolor: "#ef4444" }} />
            <Box sx={{ width: 12, height: 12, borderRadius: "50%", bgcolor: "#f59e0b" }} />
            <Box sx={{ width: 12, height: 12, borderRadius: "50%", bgcolor: "#10b981" }} />
            <Typography variant="subtitle2" fontWeight="800" sx={{ color: "#94a3b8", pl: 1, fontFamily: "monospace" }}>
              SCHEMA_GENERATOR.log
            </Typography>
          </Stack>
          {result && (
            <Chip 
              label={result.error ? "FAILED" : "SUCCESS"} 
              color={result.error ? "error" : "success"} 
              size="small" 
              sx={{ fontWeight: "bold", fontSize: "0.7rem" }} 
            />
          )}
        </Box>
        
        {/* Terminal Screen */}
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ 
            p: 3, 
            bgcolor: "#0b0f19", 
            fontFamily: "Fira Code, Source Code Pro, Courier New, monospace",
            overflow: "auto", 
            maxHeight: 500,
            minHeight: 180
          }}>
            {result ? (
              <pre style={{ 
                margin: 0, 
                fontSize: "14px", 
                color: result.error ? "#f87171" : "#10b981",
                lineHeight: 1.6,
                whiteSpace: "pre-wrap"
              }}>
                {JSON.stringify(result, null, 2)}
              </pre>
            ) : (
              <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", py: 5, color: "#475569" }}>
                <Typography variant="body1" sx={{ fontFamily: "monospace", mb: 1 }}>
                  &gt; Waiting for schema compilation...
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: "monospace", fontSize: "0.8rem" }}>
                  Fill out the column inputs, check properties, and execute layout builder.
                </Typography>
              </Box>
            )}
          </Box>
        </CardContent>
      </Card>
    </Stack>
  );
}
