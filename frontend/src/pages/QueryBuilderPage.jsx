import { useState } from "react";
import {
  Box, Button, Card, CardContent, FormControlLabel, Grid, MenuItem, Stack, Switch, TextField, Typography
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { setLatestResult } from "../app/querySlice";
import api from "../api/client";

const defaultIr = {
  type: "SELECT", select: ["*"], from: "", values: {}, joins: [], where: [], groupBy: [], having: [], orderBy: [], limit: 50, offset: 0, distinct: false
};

/** SQL uses `=`; normalize JS-style `==` before sending joins to the API. */
function normalizeJoinOn(on) {
  let n = on.trim();
  while (n.includes("==")) {
    n = n.replaceAll("==", "=");
  }
  return n;
}

export default function QueryBuilderPage() {
  const [ir, setIr] = useState(defaultIr);
  const [valuesText, setValuesText] = useState("");
  const dispatch = useDispatch();
  const result = useSelector((state) => state.query.latestResult);

  const addJoin = () => {
    setIr({
      ...ir,
      joins: [...(ir.joins || []), { type: "INNER", table: "", on: "" }]
    });
  };

  const updateJoin = (index, field, value) => {
    const next = [...(ir.joins || [])];
    next[index] = { ...next[index], [field]: value };
    setIr({ ...ir, joins: next });
  };

  const removeJoin = (index) => {
    setIr({
      ...ir,
      joins: (ir.joins || []).filter((_, i) => i !== index)
    });
  };

  const execute = async () => {
    try {
      // Parse valuesText (key=value, key2=value2) into values object
      const values = {};
      valuesText.split(",").forEach(pair => {
        const parts = pair.split("=");
        if (parts.length === 2) {
          const k = parts[0].trim();
          const v = parts[1].trim();
          if (k && v) values[k] = v;
        }
      });

      const cleanSelect = ir.select.map(v => v.trim()).filter(Boolean);
      if (cleanSelect.length === 0) cleanSelect.push("*");
      const joins = (ir.joins || [])
        .map((j) => ({
          type: (j.type || "INNER").trim(),
          table: (j.table || "").trim(),
          on: normalizeJoinOn(j.on || "")
        }))
        .filter((j) => {
          if (!j.table) return false;
          if (j.type.toUpperCase() === "CROSS") return true;
          return Boolean(j.on);
        });
      const payload = { ...ir, values, select: cleanSelect, joins };
      const { data } = await api.post("/queries/execute", payload);
      dispatch(setLatestResult(data));
    } catch (err) {
      console.error(err);
      dispatch(setLatestResult({ 
        error: "Query Failed", 
        message: err.response?.data?.message || err.message,
        details: err.response?.data
      }));
    }
  };

  return (
    <Stack spacing={3} sx={{ p: 4, bgcolor: "#f0f2f5", minHeight: "100vh" }}>
      <Typography variant="h4" fontWeight="800" color="primary" gutterBottom>
        🚀 Smart Query Builder
      </Typography>
      
      <Card sx={{ boxShadow: 6, borderRadius: 4 }}>
        <CardContent sx={{ p: 4 }}>
          <Grid container spacing={3} alignItems="flex-end">
            {/* Header: Query Type & Table */}
            <Grid item xs={12} md={3}>
              <TextField select fullWidth label="Action" value={ir.type}
                onChange={(e) => setIr({ ...ir, type: e.target.value })}>
                <MenuItem value="SELECT">SELECT Data</MenuItem>
                <MenuItem value="INSERT">INSERT New</MenuItem>
                <MenuItem value="UPDATE">UPDATE Existing</MenuItem>
                <MenuItem value="DELETE">DELETE Data</MenuItem>
              </TextField>
            </Grid>

            {ir.type === "SELECT" && (
              <Grid item xs={12} md={4}>
                <TextField fullWidth label="Target Columns" value={ir.select.join(",")}
                  onChange={(e) => setIr({ ...ir, select: e.target.value.split(",") })}
                  placeholder="* (for all columns)" />
              </Grid>
            )}

            <Grid item xs={12} md={ir.type === "SELECT" ? 5 : 9}>
              <TextField fullWidth label="FROM Table" value={ir.from} 
                onChange={(e) => setIr({ ...ir, from: e.target.value })} 
                placeholder="e.g. users" />
            </Grid>

            {ir.type === "SELECT" && (
              <Grid item xs={12}>
                <Box sx={{ p: 2, bgcolor: "#e8f4fd", borderRadius: 2, border: "1px dashed #64b5f6" }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      JOIN TABLES
                    </Typography>
                    <Button size="small" variant="outlined" onClick={addJoin}>
                      + Add join
                    </Button>
                  </Stack>
                  {(ir.joins || []).length === 0 && (
                    <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>
                      Optional: chain tables with INNER / LEFT / RIGHT / FULL OUTER / CROSS (CROSS has no ON). SQL uses a single
                      <code style={{ margin: "0 4px" }}>=</code>
                      for equality; <code style={{ margin: "0 4px" }}>==</code>
                      from languages like JavaScript is accepted and converted. This database links{" "}
                      <strong>users</strong> and <strong>roles</strong> directly via <strong>users.role_id</strong>: add a join — table <code>roles</code>, ON{" "}
                      <code>roles.id = users.role_id</code>.
                    </Typography>
                  )}
                  {(ir.joins || []).map((join, idx) => (
                    <Grid container spacing={2} alignItems="flex-start" key={idx} sx={{ mb: 2 }}>
                      <Grid item xs={12} sm={6} md={2}>
                        <TextField
                          select
                          fullWidth
                          size="small"
                          label="Join type"
                          value={join.type || "INNER"}
                          onChange={(e) => updateJoin(idx, "type", e.target.value)}
                        >
                          <MenuItem value="INNER">INNER</MenuItem>
                          <MenuItem value="LEFT">LEFT</MenuItem>
                          <MenuItem value="RIGHT">RIGHT</MenuItem>
                          <MenuItem value="FULL OUTER">FULL OUTER</MenuItem>
                          <MenuItem value="CROSS">CROSS</MenuItem>
                        </TextField>
                      </Grid>
                      <Grid item xs={12} sm={6} md={4}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Table (optional alias)"
                          value={join.table || ""}
                          onChange={(e) => updateJoin(idx, "table", e.target.value)}
                          placeholder="e.g. orders o"
                        />
                      </Grid>
                      <Grid item xs={12} md={5}>
                        <TextField
                          fullWidth
                          size="small"
                          label="ON condition"
                          value={join.on || ""}
                          onChange={(e) => updateJoin(idx, "on", e.target.value)}
                          placeholder={(join.type || "").toUpperCase() === "CROSS" ? "Not used for CROSS" : "e.g. roles.id = users.role_id (single =)"}
                          disabled={(join.type || "").toUpperCase() === "CROSS"}
                        />
                      </Grid>
                      <Grid item xs={12} md={1} sx={{ display: "flex", alignItems: "center" }}>
                        <Button size="small" color="error" onClick={() => removeJoin(idx)}>
                          Remove
                        </Button>
                      </Grid>
                    </Grid>
                  ))}
                </Box>
              </Grid>
            )}

            {/* WHERE Section */}
            {ir.type !== "INSERT" && (
              <Grid item xs={12}>
                <Box sx={{ p: 2, bgcolor: "#f8f9fa", borderRadius: 2, border: "1px dashed #ccc" }}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>FILTER (WHERE CLAUSE)</Typography>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={4}>
                      <TextField fullWidth label="Database Field" 
                        onChange={(e) => {
                          const newWhere = [...(ir.where || [])];
                          if (newWhere.length === 0) newWhere.push({ field: "", operator: "=", value: "" });
                          newWhere[0].field = e.target.value;
                          setIr({ ...ir, where: newWhere });
                        }}
                        placeholder="e.g. email" />
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <TextField select fullWidth label="Equality" defaultValue="="
                        onChange={(e) => {
                          const newWhere = [...(ir.where || [])];
                          if (newWhere.length === 0) newWhere.push({ field: "", operator: "=", value: "" });
                          newWhere[0].operator = e.target.value;
                          setIr({ ...ir, where: newWhere });
                        }}>
                        <MenuItem value="=">Equals (=)</MenuItem>
                        <MenuItem value=">">Greater Than (&gt;)</MenuItem>
                        <MenuItem value="<">Less Than (&lt;)</MenuItem>
                        <MenuItem value=">=">Greater or Equal (&gt;=)</MenuItem>
                        <MenuItem value="<=">Less or Equal (&lt;=)</MenuItem>
                        <MenuItem value="LIKE">Matches (LIKE)</MenuItem>
                      </TextField>
                    </Grid>
                    <Grid item xs={12} md={5}>
                      <TextField fullWidth label="Comparison Value" 
                        onChange={(e) => {
                          const newWhere = [...(ir.where || [])];
                          if (newWhere.length === 0) newWhere.push({ field: "", operator: "=", value: "" });
                          newWhere[0].value = e.target.value;
                          setIr({ ...ir, where: newWhere });
                        }}
                        placeholder="e.g. admin@example.com" />
                    </Grid>
                  </Grid>
                </Box>
              </Grid>
            )}

            {/* Values for INSERT/UPDATE */}
            {(ir.type === "INSERT" || ir.type === "UPDATE") && (
              <Grid item xs={12}>
                <TextField fullWidth label="Update Values (Format: col1=val1, col2=val2)" value={valuesText}
                  onChange={(e) => setValuesText(e.target.value)} 
                  placeholder="name=John, email=john@example.com" />
              </Grid>
            )}

            {/* Pagination & Sorting */}
            {ir.type === "SELECT" && (
              <>
                <Grid item xs={12} md={3}>
                  <TextField select fullWidth label="Order By" value={ir.orderBy[0]?.direction ?? "ASC"}
                    onChange={(e) => {
                      const cleanSelect = ir.select.map(v => v.trim()).filter(Boolean);
                      const field = (cleanSelect[0] && cleanSelect[0] !== "*") ? cleanSelect[0] : "id";
                      setIr({ ...ir, orderBy: [{ field, direction: e.target.value }] });
                    }}>
                    <MenuItem value="ASC">Oldest First (ASC)</MenuItem>
                    <MenuItem value="DESC">Newest First (DESC)</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField fullWidth type="number" label="Max Results (Limit)" value={ir.limit}
                    onChange={(e) => setIr({ ...ir, limit: Number(e.target.value) })} />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField fullWidth type="number" label="Skip (Offset)" value={ir.offset}
                    onChange={(e) => setIr({ ...ir, offset: Number(e.target.value) })} />
                </Grid>
                <Grid item xs={12} md={3} sx={{ display: "flex", alignItems: "center" }}>
                  <FormControlLabel control={<Switch checked={ir.distinct} onChange={(e) => setIr({ ...ir, distinct: e.target.checked })} />} label="Remove Duplicates" />
                </Grid>
              </>
            )}
          </Grid>

          <Stack direction="row" spacing={2} sx={{ mt: 5 }}>
            <Button variant="contained" size="large" onClick={execute} sx={{ py: 1.5, px: 6, borderRadius: 3, fontWeight: "bold" }}>⚡ EXECUTE QUERY</Button>
            <Button variant="outlined" size="large" onClick={() => { setIr(defaultIr); setValuesText(""); }} sx={{ py: 1.5, px: 6, borderRadius: 3 }}>RESET</Button>
          </Stack>
        </CardContent>
      </Card>

      <Card sx={{ boxShadow: 6, borderRadius: 4, overflow: "hidden" }}>
        <Box sx={{ px: 4, py: 2, bgcolor: "#333", color: "#fff" }}>
          <Typography variant="h6" fontWeight="bold">Query Result</Typography>
        </Box>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ 
            p: 3, 
            bgcolor: "#fdf8ff", 
            borderRadius: 3, 
            border: "1px solid #e1bee7",
            fontFamily: "monospace",
            overflow: "auto", 
            maxHeight: 500
          }}>
            {result ? (
              <pre style={{ margin: 0, fontSize: "14px", color: "#4a148c" }}>{JSON.stringify(result, null, 2)}</pre>
            ) : (
              <Typography color="text.secondary" textAlign="center" sx={{ py: 4 }}>
                No records found. Adjust your filters and try again.
              </Typography>
            )}
          </Box>
        </CardContent>
      </Card>
    </Stack>
  );
}
