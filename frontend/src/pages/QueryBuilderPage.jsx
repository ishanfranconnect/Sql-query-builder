import { useState } from "react";
import {
  Box, Button, Card, CardContent, FormControlLabel, Grid, MenuItem, Stack, Switch, TextField, Typography, Dialog, DialogTitle, DialogContent, DialogActions
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

function getTableAlias(table) {
  if (!table) return "u";
  const cleaned = table.trim();
  return cleaned ? cleaned[0].toLowerCase() : "u";
}

export default function QueryBuilderPage() {
  const [ir, setIr] = useState(defaultIr);
  const [valuesText, setValuesText] = useState("");
  const [selectedAgg, setSelectedAgg] = useState("");
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [queryName, setQueryName] = useState("");
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

  const addWhere = () => {
    setIr({
      ...ir,
      where: [...(ir.where || []), { logic: "AND", field: "", operator: "=", value: "" }]
    });
  };

  const removeWhere = (idx) => {
    setIr({ ...ir, where: (ir.where || []).filter((_, i) => i !== idx) });
  };

  const updateWhereField = (idx, value) => {
    const next = [...(ir.where || [])];
    next[idx] = { ...next[idx], field: value };
    setIr({ ...ir, where: next });
  };

  const updateWhereOperator = (idx, value) => {
    const next = [...(ir.where || [])];
    next[idx] = { ...next[idx], operator: value };
    setIr({ ...ir, where: next });
  };

  const updateWhereValue = (idx, value) => {
    const next = [...(ir.where || [])];
    next[idx] = { ...next[idx], value: value };
    setIr({ ...ir, where: next });
  };

  const updateWhereLogic = (idx, value) => {
    const next = [...(ir.where || [])];
    next[idx] = { ...next[idx], logic: value };
    setIr({ ...ir, where: next });
  };

  const addHaving = () => {
    setIr({
      ...ir,
      having: [...(ir.having || []), { logic: "AND", field: "", operator: "=", value: "" }]
    });
  };

  const removeHaving = (idx) => {
    setIr({ ...ir, having: (ir.having || []).filter((_, i) => i !== idx) });
  };

  const updateHavingField = (idx, value) => {
    const next = [...(ir.having || [])];
    next[idx] = { ...next[idx], field: value };
    setIr({ ...ir, having: next });
  };

  const updateHavingOperator = (idx, value) => {
    const next = [...(ir.having || [])];
    next[idx] = { ...next[idx], operator: value };
    setIr({ ...ir, having: next });
  };

  const updateHavingValue = (idx, value) => {
    const next = [...(ir.having || [])];
    next[idx] = { ...next[idx], value: value };
    setIr({ ...ir, having: next });
  };

  const addOrderBy = () => {
    setIr({
      ...ir,
      orderBy: [...(ir.orderBy || []), { field: "", direction: "ASC" }]
    });
  };

  const removeOrderBy = (idx) => {
    setIr({ ...ir, orderBy: (ir.orderBy || []).filter((_, i) => i !== idx) });
  };

  const updateOrderByField = (idx, value) => {
    const next = [...(ir.orderBy || [])];
    next[idx] = { ...next[idx], field: value };
    setIr({ ...ir, orderBy: next });
  };

  const updateOrderByDirection = (idx, value) => {
    const next = [...(ir.orderBy || [])];
    next[idx] = { ...next[idx], direction: value };
    setIr({ ...ir, orderBy: next });
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
      const where = (ir.where || []).filter(cond => cond.field && cond.value);
      const having = (ir.having || []).filter(cond => cond.field && cond.value);
      const orderBy = (ir.orderBy || []).filter(o => o.field);
      const payload = { ...ir, values, select: cleanSelect, joins, where, having, orderBy };
      const { data } = await api.post("/queries/execute", payload);
      
      if (data.status === "PENDING_APPROVAL" || data.status === "PENDING") {
        alert("Your modification request has been submitted for admin approval.");
        dispatch(setLatestResult({ 
          message: "Request sent for admin approval",
          status: "PENDING",
          sql: data.sql 
        }));
      } else {
        dispatch(setLatestResult(data));
      }
    } catch (err) {
      console.error(err);
      dispatch(setLatestResult({ 
        error: "Query Failed", 
        message: err.response?.data?.message || err.message,
        details: err.response?.data
      }));
    }
  };

  const saveQuery = async () => {
    if (!queryName) return;
    try {
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
      const where = (ir.where || []).filter(cond => cond.field && cond.value);
      const having = (ir.having || []).filter(cond => cond.field && cond.value);
      const orderBy = (ir.orderBy || []).filter(o => o.field);
      const payloadQuery = { ...ir, values, select: cleanSelect, joins, where, having, orderBy };
      
      await api.post("/queries/save", { name: queryName, query: payloadQuery });
      setSaveDialogOpen(false);
      setQueryName("");
      alert("Query saved successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to save query");
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
                onChange={(e) => {
                  setIr({ ...defaultIr, type: e.target.value });
                  setValuesText("");
                  setSelectedAgg("");
                }}>
                <MenuItem value="SELECT">SELECT Data</MenuItem>
                <MenuItem value="INSERT">INSERT New</MenuItem>
                <MenuItem value="UPDATE">UPDATE Existing</MenuItem>
                <MenuItem value="DELETE">DELETE Data</MenuItem>
              </TextField>
            </Grid>

            {ir.type === "SELECT" && (
              <>
                <Grid item xs={12} md={4}>
                  <TextField fullWidth label="Target Columns" value={ir.select.join(",")}
                    onChange={(e) => setIr({ ...ir, select: e.target.value.split(",") })}
                    placeholder="* (for all columns)" />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField select fullWidth label="Add Aggregate Function" value={selectedAgg} onChange={(e) => setSelectedAgg(e.target.value)}>
                    <MenuItem value="">Select Aggregate</MenuItem>
                    <MenuItem value="COUNT()">COUNT()</MenuItem>
                    <MenuItem value="SUM()">SUM()</MenuItem>
                    <MenuItem value="AVG()">AVG()</MenuItem>
                    <MenuItem value="MIN()">MIN()</MenuItem>
                    <MenuItem value="MAX()">MAX()</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} md={2} sx={{ display: "flex", alignItems: "center" }}>
                  <Button variant="contained" color="primary" fullWidth size="large" sx={{ minHeight: 56, borderRadius: 3, textTransform: "none" }} onClick={() => {
                    if (selectedAgg) {
                      const current = ir.select.join(",");
                      const newSelect = current ? current + "," + selectedAgg : selectedAgg;
                      setIr({ ...ir, select: newSelect.split(",") });
                      setSelectedAgg("");
                    }
                  }}>Add</Button>
                </Grid>
              </>
            )}

            <Grid item xs={12} md={ir.type === "SELECT" ? 12 : 9}>
              <TextField fullWidth label="FROM Table" value={ir.from} 
                onChange={(e) => setIr({ ...ir, from: e.target.value })} 
                placeholder="e.g. users" />
            </Grid>

            {ir.type === "SELECT" && (
              <Grid item xs={12} md={6}>
                <Box sx={{ p: 2, bgcolor: "#e8f4fd", borderRadius: 2, border: "1px dashed #64b5f6", minHeight: 220 }}>
                  <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      JOIN TABLES
                    </Typography>
                    <Button size="small" variant="outlined" onClick={addJoin}>
                      + Add join
                    </Button>
                  </Stack>
                  {(ir.joins || []).length === 0 && (
                    <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>
                      Add tables to join with the main table. Use aliases for clarity.
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
              <Grid item xs={12} md={6}>
                <Box sx={{ p: 2, bgcolor: "#f8f9fa", borderRadius: 2, border: "1px dashed #ccc", minHeight: 220 }}>
                  <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">FILTER (WHERE CLAUSE)</Typography>
                    <Button size="small" variant="outlined" onClick={addWhere}>+ Add WHERE Condition</Button>
                  </Stack>
                  {(ir.where || []).length === 0 ? (
                    <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>
                      Add one or more filter conditions and connect them with AND / OR.
                    </Typography>
                  ) : (
                    (ir.where || []).map((cond, idx) => (
                      <Grid container spacing={2} alignItems="center" key={idx} sx={{ mb: 1 }}>
                        {idx > 0 && (
                          <Grid item xs={12} md={1}>
                            <TextField select fullWidth size="small" value={cond.logic || "AND"} onChange={(e) => updateWhereLogic(idx, e.target.value)}>
                              <MenuItem value="AND">AND</MenuItem>
                              <MenuItem value="OR">OR</MenuItem>
                            </TextField>
                          </Grid>
                        )}
                        <Grid item xs={12} md={idx > 0 ? 3 : 4}>
                          <TextField fullWidth size="small" label="Field" value={cond.field || ""} onChange={(e) => updateWhereField(idx, e.target.value)} placeholder="e.g. users.id" />
                        </Grid>
                        <Grid item xs={12} md={3}>
                          <TextField select fullWidth size="small" label="Operator" value={cond.operator || "="} onChange={(e) => updateWhereOperator(idx, e.target.value)}>
                            <MenuItem value="=">Equals (=)</MenuItem>
                            <MenuItem value=">">Greater Than (&gt;)</MenuItem>
                            <MenuItem value="<">Less Than (&lt;)</MenuItem>
                            <MenuItem value=">=">Greater or Equal (&gt;=)</MenuItem>
                            <MenuItem value="<=">Less or Equal (&lt;=)</MenuItem>
                            <MenuItem value="LIKE">Matches (LIKE)</MenuItem>
                          </TextField>
                        </Grid>
                        <Grid item xs={12} md={idx > 0 ? 4 : 3}>
                          <TextField fullWidth size="small" label="Value" value={cond.value || ""} onChange={(e) => updateWhereValue(idx, e.target.value)} placeholder="e.g. admin@example.com" />
                        </Grid>
                        <Grid item xs={12} md={1} sx={{ display: "flex", alignItems: "center" }}>
                          <Button size="small" color="error" onClick={() => removeWhere(idx)}>Remove</Button>
                        </Grid>
                      </Grid>
                    ))
                  )}
                </Box>
              </Grid>
            )}

            {/* GROUP BY Section */}
            {ir.type === "SELECT" && (
              <Grid item xs={12} md={6}>
                <Box sx={{ p: 2, bgcolor: "#f8f9fa", borderRadius: 2, border: "1px dashed #ccc", minHeight: 160 }}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>GROUP BY CLAUSE</Typography>
                  <TextField fullWidth label="Group By Fields (comma separated)" 
                    value={(ir.groupBy || []).join(", ")}
                    onChange={(e) => {
                      const fields = e.target.value.split(",").map(f => f.trim()).filter(Boolean);
                      setIr({ ...ir, groupBy: fields });
                    }}
                    placeholder="e.g. role, status" />
                </Box>
              </Grid>
            )}

            {/* HAVING Section */}
            {ir.type === "SELECT" && (
              <Grid item xs={12} md={6}>
                <Box sx={{ p: 2, bgcolor: "#f8f9fa", borderRadius: 2, border: "1px dashed #ccc", minHeight: 220 }}>
                  <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">FILTER AGGREGATES (HAVING CLAUSE)</Typography>
                    <Button size="small" variant="outlined" onClick={addHaving}>+ Add HAVING Condition</Button>
                  </Stack>
                  {(ir.having || []).length === 0 ? (
                    <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>
                      Add aggregate filters and combine them with AND / OR.
                    </Typography>
                  ) : (
                    (ir.having || []).map((cond, idx) => (
                      <Grid container spacing={2} alignItems="center" key={idx} sx={{ mb: 1 }}>
                        {idx > 0 && (
                          <Grid item xs={12} md={1}>
                            <TextField select fullWidth size="small" value={cond.logic || "AND"} onChange={(e) => updateHavingLogic(idx, e.target.value)}>
                              <MenuItem value="AND">AND</MenuItem>
                              <MenuItem value="OR">OR</MenuItem>
                            </TextField>
                          </Grid>
                        )}
                        <Grid item xs={12} md={idx > 0 ? 3 : 4}>
                          <TextField fullWidth size="small" label="Field" value={cond.field || ""} onChange={(e) => updateHavingField(idx, e.target.value)} placeholder="e.g. COUNT(*)" />
                        </Grid>
                        <Grid item xs={12} md={3}>
                          <TextField select fullWidth size="small" label="Operator" value={cond.operator || "="} onChange={(e) => updateHavingOperator(idx, e.target.value)}>
                            <MenuItem value="=">Equals (=)</MenuItem>
                            <MenuItem value=">">Greater Than (&gt;)</MenuItem>
                            <MenuItem value="<">Less Than (&lt;)</MenuItem>
                            <MenuItem value=">=">Greater or Equal (&gt;=)</MenuItem>
                            <MenuItem value="<=">Less or Equal (&lt;=)</MenuItem>
                            <MenuItem value="LIKE">Matches (LIKE)</MenuItem>
                          </TextField>
                        </Grid>
                        <Grid item xs={12} md={idx > 0 ? 4 : 3}>
                          <TextField fullWidth size="small" label="Value" value={cond.value || ""} onChange={(e) => updateHavingValue(idx, e.target.value)} placeholder="e.g. 5" />
                        </Grid>
                        <Grid item xs={12} md={1} sx={{ display: "flex", alignItems: "center" }}>
                          <Button size="small" color="error" onClick={() => removeHaving(idx)}>Remove</Button>
                        </Grid>
                      </Grid>
                    ))
                  )}
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
                {/* Order By */}
                {(ir.orderBy || []).map((o, idx) => (
                  <Grid item xs={12} key={idx}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <TextField fullWidth label={`Order By Field ${idx + 1}`} value={o.field}
                        onChange={(e) => updateOrderByField(idx, e.target.value)}
                        placeholder="e.g. u.id, r.name" />
                      <TextField select fullWidth label="Direction" value={o.direction}
                        onChange={(e) => updateOrderByDirection(idx, e.target.value)}
                        sx={{ minWidth: 120 }}>
                        <MenuItem value="ASC">ASC</MenuItem>
                        <MenuItem value="DESC">DESC</MenuItem>
                      </TextField>
                      <Button variant="outlined" color="error" onClick={() => removeOrderBy(idx)} sx={{ minWidth: 80 }}>Remove</Button>
                    </Stack>
                  </Grid>
                ))}
                <Grid item xs={12} sx={{ mt: 2 }}>
                  <Button variant="contained" color="primary" fullWidth onClick={addOrderBy} sx={{ borderRadius: 3, py: 1.25, textTransform: "none" }}>
                    + Add Order By
                  </Button>
                </Grid>

                <Grid item xs={12} md={4}>
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

          <Stack direction="row" spacing={2} sx={{ mt: 5, justifyContent: "center" }}>
            <Button variant="contained" size="large" onClick={execute} sx={{ py: 1.5, px: 6, borderRadius: 3, fontWeight: "bold" }}>⚡ EXECUTE QUERY</Button>
            <Button variant="contained" color="secondary" size="large" onClick={() => setSaveDialogOpen(true)} sx={{ py: 1.5, px: 6, borderRadius: 3, fontWeight: "bold" }}>💾 SAVE QUERY</Button>
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

      <Dialog open={saveDialogOpen} onClose={() => setSaveDialogOpen(false)}>
        <DialogTitle>Save Query</DialogTitle>
        <DialogContent>
          <TextField autoFocus margin="dense" label="Query Name" fullWidth value={queryName} onChange={(e) => setQueryName(e.target.value)} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSaveDialogOpen(false)}>Cancel</Button>
          <Button onClick={saveQuery} variant="contained" color="primary">Save</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
