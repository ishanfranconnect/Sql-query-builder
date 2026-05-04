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
} from "@mui/material";
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
    <Stack spacing={3} sx={{ p: 4, bgcolor: "#f0f2f5", minHeight: "100vh" }}>
      <Typography variant="h4" fontWeight="800" color="primary" gutterBottom>
        Create table
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Define columns with MySQL types and constraints. At least one column must be marked as primary key.
        AUTO_INCREMENT must be enabled only on the primary key column.
      </Typography>

      <Card sx={{ boxShadow: 6, borderRadius: 4 }}>
        <CardContent sx={{ p: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                label="Table name"
                value={tableName}
                onChange={(e) => setTableName(e.target.value)}
                placeholder="e.g. orders"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Display name (optional)"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Shown in metadata; defaults to table name"
              />
            </Grid>
          </Grid>

          <Typography variant="subtitle1" sx={{ mt: 3, mb: 2 }} fontWeight={600}>
            Columns
          </Typography>

          {columns.map((col, idx) => (
            <Box
              key={idx}
              sx={{
                p: 2,
                mb: 2,
                bgcolor: "#f8f9fa",
                borderRadius: 2,
                border: "1px dashed #ccc",
              }}
            >
              <Grid container spacing={2} alignItems="flex-start">
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Column name"
                    value={col.columnName}
                    onChange={(e) => updateColumn(idx, "columnName", e.target.value)}
                    placeholder="id"
                  />
                </Grid>
                <Grid item xs={12} md={2}>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    label="Quick type"
                    value={presetTypes[idx] === undefined ? "" : presetTypes[idx]}
                    onChange={(e) => applyPreset(idx, e.target.value)}
                  >
                    <MenuItem value="">
                      <em>Use manual type below</em>
                    </MenuItem>
                    {DATA_TYPE_PRESETS.map((p) => (
                      <MenuItem key={p} value={p}>
                        {p}
                      </MenuItem>
                    ))}
                    <MenuItem value="custom">Custom…</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Data type"
                    value={col.dataType}
                    onChange={(e) => updateColumn(idx, "dataType", e.target.value)}
                    placeholder="INT or VARCHAR(255)"
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Default"
                    value={col.defaultValue}
                    onChange={(e) => updateColumn(idx, "defaultValue", e.target.value)}
                    placeholder="NULL, 0, or 'text'"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Stack direction="row" flexWrap="wrap" gap={1} alignItems="center">
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={col.notNull}
                          onChange={(e) => updateColumn(idx, "notNull", e.target.checked)}
                        />
                      }
                      label="NOT NULL"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={col.primaryKey}
                          onChange={(e) => updateColumn(idx, "primaryKey", e.target.checked)}
                        />
                      }
                      label="PRIMARY KEY"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={col.unique}
                          onChange={(e) => updateColumn(idx, "unique", e.target.checked)}
                          disabled={col.primaryKey}
                        />
                      }
                      label="UNIQUE"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={col.autoIncrement}
                          onChange={(e) => updateColumn(idx, "autoIncrement", e.target.checked)}
                        />
                      }
                      label="AUTO_INCREMENT"
                    />
                    <Button
                      size="small"
                      color="error"
                      onClick={() => removeColumn(idx)}
                      disabled={columns.length <= 1}
                    >
                      Remove column
                    </Button>
                  </Stack>
                </Grid>
              </Grid>
            </Box>
          ))}

          <Button variant="outlined" onClick={addColumn} sx={{ mt: 1, textTransform: "none" }}>
            + Add column
          </Button>

          <Stack direction="row" spacing={2} sx={{ mt: 4, justifyContent: "center" }}>
            <Button
              variant="contained"
              size="large"
              onClick={submit}
              disabled={loading}
              sx={{ py: 1.5, px: 6, borderRadius: 3, fontWeight: "bold" }}
            >
              {loading ? "Creating…" : "Create table"}
            </Button>
          </Stack>
        </CardContent>
      </Card>

      <Card sx={{ boxShadow: 6, borderRadius: 4, overflow: "hidden" }}>
        <Box sx={{ px: 4, py: 2, bgcolor: "#333", color: "#fff" }}>
          <Typography variant="h6" fontWeight="bold">
            Result
          </Typography>
        </Box>
        <CardContent sx={{ p: 4 }}>
          <Box
            sx={{
              p: 3,
              bgcolor: result?.error ? "#ffebee" : "#fdf8ff",
              borderRadius: 3,
              border: `1px solid ${result?.error ? "#ef9a9a" : "#e1bee7"}`,
              fontFamily: "monospace",
              overflow: "auto",
              maxHeight: 400,
            }}
          >
            {result ? (
              <pre style={{ margin: 0, fontSize: "14px", color: result.error ? "#b71c1c" : "#4a148c" }}>
                {JSON.stringify(result, null, 2)}
              </pre>
            ) : (
              <Typography color="text.secondary" textAlign="center" sx={{ py: 2 }}>
                Submit the form to run CREATE TABLE and save metadata.
              </Typography>
            )}
          </Box>
        </CardContent>
      </Card>
    </Stack>
  );
}
