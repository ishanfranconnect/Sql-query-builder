import { useState } from "react";
import {
  Box, Button, Card, CardContent, FormControlLabel, Grid, MenuItem, Stack, Switch, TextField, Typography, Dialog, DialogTitle, DialogContent, DialogActions, Chip
} from "@mui/material";
import { Link } from "react-router-dom";
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

  const updateHavingLogic = (idx, value) => {
    const next = [...(ir.having || [])];
    next[idx] = { ...next[idx], logic: value };
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
    <Stack spacing={4} sx={{ pb: 6 }}>
      {/* Title Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Box>
          <Typography variant="h4" fontWeight="900" sx={{ background: "linear-gradient(90deg, #1e3a8a, #3b82f6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", mb: 0.5 }}>
            🚀 Smart Query Builder
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Visually compose and test SQL queries with automatic safety boundaries.
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
          <Grid container spacing={3} alignItems="flex-end">
            {/* Header: Query Type Selector */}
            <Grid item xs={12} md={3}>
              <TextField select fullWidth label="SQL Action Type" value={ir.type}
                onChange={(e) => {
                  setIr({ ...defaultIr, type: e.target.value });
                  setValuesText("");
                  setSelectedAgg("");
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 3,
                    bgcolor: "rgba(0, 0, 0, 0.01)"
                  }
                }}>
                <MenuItem value="SELECT">SELECT (Retrieve Data)</MenuItem>
                <MenuItem value="INSERT">INSERT (Create Record)</MenuItem>
                <MenuItem value="UPDATE">UPDATE (Modify Record)</MenuItem>
                <MenuItem value="DELETE">DELETE (Remove Record)</MenuItem>
              </TextField>
            </Grid>

            {ir.type === "SELECT" && (
              <>
                <Grid item xs={12} md={4}>
                  <TextField fullWidth label="Target Columns" value={ir.select.join(",")}
                    onChange={(e) => setIr({ ...ir, select: e.target.value.split(",") })}
                    placeholder="* (for all columns)"
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 3 } }} />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField select fullWidth label="Quick Aggregate Function" value={selectedAgg} 
                    onChange={(e) => setSelectedAgg(e.target.value)}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 3 } }}>
                    <MenuItem value="">Select Aggregate</MenuItem>
                    <MenuItem value="COUNT(*)">COUNT(*)</MenuItem>
                    <MenuItem value="SUM()">SUM()</MenuItem>
                    <MenuItem value="AVG()">AVG()</MenuItem>
                    <MenuItem value="MIN()">MIN()</MenuItem>
                    <MenuItem value="MAX()">MAX()</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} md={2}>
                  <Button variant="contained" fullWidth size="large" 
                    onClick={() => {
                      if (selectedAgg) {
                        const current = ir.select.join(",").trim();
                        const isWildcardOnly = current === "*";
                        const newSelect = (current && !isWildcardOnly) ? current + "," + selectedAgg : selectedAgg;
                        setIr({ ...ir, select: newSelect.split(",") });
                        setSelectedAgg("");
                      }
                    }}
                    sx={{ 
                      minHeight: 56, 
                      borderRadius: 3, 
                      textTransform: "none",
                      fontWeight: "bold",
                      bgcolor: "#1e3a8a",
                      "&:hover": { bgcolor: "#111827" }
                    }}>
                    Add Field
                  </Button>
                </Grid>
              </>
            )}

            <Grid item xs={12} md={ir.type === "SELECT" ? 12 : 9}>
              <TextField fullWidth label="FROM Target Table" value={ir.from} 
                onChange={(e) => setIr({ ...ir, from: e.target.value })} 
                placeholder="e.g. users"
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 3 } }} />
            </Grid>

            {ir.type === "SELECT" && (
              <Grid item xs={12} md={6}>
                <Box sx={{ p: 3, bgcolor: "#f8fafc", borderRadius: 4, border: "1px solid #e2e8f0", minHeight: 220 }}>
                  <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                    <Typography variant="subtitle2" fontWeight="800" color="text.secondary" sx={{ letterSpacing: 0.5, textTransform: "uppercase" }}>
                      🔗 JOIN TABLES
                    </Typography>
                    <Button size="small" variant="outlined" onClick={addJoin} sx={{ borderRadius: 2, textTransform: "none", fontWeight: "bold" }}>
                      + Add Join
                    </Button>
                  </Stack>
                  {(ir.joins || []).length === 0 && (
                    <Typography variant="body2" color="text.secondary" sx={{ py: 2, fontStyle: "italic" }}>
                      No join conditions specified. Add tables to query across relationships.
                    </Typography>
                  )}
                  {(ir.joins || []).map((join, idx) => (
                    <Grid container spacing={1.5} alignItems="flex-start" key={idx} sx={{ mb: 2 }}>
                      <Grid item xs={12} sm={3}>
                        <TextField select fullWidth size="small" label="Type" value={join.type || "INNER"}
                          onChange={(e) => updateJoin(idx, "type", e.target.value)}
                          sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2.5 } }}>
                          <MenuItem value="INNER">INNER</MenuItem>
                          <MenuItem value="LEFT">LEFT</MenuItem>
                          <MenuItem value="RIGHT">RIGHT</MenuItem>
                          <MenuItem value="FULL OUTER">FULL</MenuItem>
                          <MenuItem value="CROSS">CROSS</MenuItem>
                        </TextField>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <TextField fullWidth size="small" label="Table & Alias" value={join.table || ""}
                          onChange={(e) => updateJoin(idx, "table", e.target.value)}
                          placeholder="orders o"
                          sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2.5 } }} />
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <TextField fullWidth size="small" label="ON Clause" value={join.on || ""}
                          onChange={(e) => updateJoin(idx, "on", e.target.value)}
                          placeholder="o.user_id = u.id"
                          disabled={(join.type || "").toUpperCase() === "CROSS"}
                          sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2.5 } }} />
                      </Grid>
                      <Grid item xs={12} sm={1} sx={{ display: "flex", justifyContent: "center", mt: 0.5 }}>
                        <Button color="error" onClick={() => removeJoin(idx)} sx={{ minWidth: "auto", p: 0.5, fontWeight: "bold" }}>
                          ✕
                        </Button>
                      </Grid>
                    </Grid>
                  ))}
                </Box>
              </Grid>
            )}

            {/* WHERE Clause Section */}
            {ir.type !== "INSERT" && (
              <Grid item xs={12} md={ir.type === "SELECT" ? 6 : 12}>
                <Box sx={{ p: 3, bgcolor: "#f8fafc", borderRadius: 4, border: "1px solid #e2e8f0", minHeight: 220 }}>
                  <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                    <Typography variant="subtitle2" fontWeight="800" color="text.secondary" sx={{ letterSpacing: 0.5, textTransform: "uppercase" }}>
                      🔍 FILTER (WHERE CLAUSE)
                    </Typography>
                    <Button size="small" variant="outlined" onClick={addWhere} sx={{ borderRadius: 2, textTransform: "none", fontWeight: "bold" }}>
                      + Add Condition
                    </Button>
                  </Stack>
                  {(ir.where || []).length === 0 ? (
                    <Typography variant="body2" color="text.secondary" sx={{ py: 2, fontStyle: "italic" }}>
                      No filter conditions defined. All records will be scanned.
                    </Typography>
                  ) : (
                    (ir.where || []).map((cond, idx) => (
                      <Grid container spacing={1.5} alignItems="center" key={idx} sx={{ mb: 1.5 }}>
                        {idx > 0 && (
                          <Grid item xs={12} md={2}>
                            <TextField select fullWidth size="small" value={cond.logic || "AND"} 
                              onChange={(e) => updateWhereLogic(idx, e.target.value)}
                              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}>
                              <MenuItem value="AND">AND</MenuItem>
                              <MenuItem value="OR">OR</MenuItem>
                            </TextField>
                          </Grid>
                        )}
                        <Grid item xs={12} md={idx > 0 ? 3 : 4}>
                          <TextField fullWidth size="small" label="Column" value={cond.field || ""} 
                            onChange={(e) => updateWhereField(idx, e.target.value)} placeholder="users.id"
                            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }} />
                        </Grid>
                        <Grid item xs={12} md={3}>
                          <TextField select fullWidth size="small" label="Operator" value={cond.operator || "="} 
                            onChange={(e) => updateWhereOperator(idx, e.target.value)}
                            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}>
                            <MenuItem value="=">Equals (=)</MenuItem>
                            <MenuItem value=">">Greater Than (&gt;)</MenuItem>
                            <MenuItem value="<">Less Than (&lt;)</MenuItem>
                            <MenuItem value=">=">Greater or Equal (&gt;=)</MenuItem>
                            <MenuItem value="<=">Less or Equal (&lt;=)</MenuItem>
                            <MenuItem value="LIKE">Matches (LIKE)</MenuItem>
                          </TextField>
                        </Grid>
                        <Grid item xs={12} md={idx > 0 ? 3 : 4}>
                          <TextField fullWidth size="small" label="Compare Value" value={cond.value || ""} 
                            onChange={(e) => updateWhereValue(idx, e.target.value)} placeholder="e.g. Active"
                            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }} />
                        </Grid>
                        <Grid item xs={12} md={1} sx={{ display: "flex", justifyContent: "center" }}>
                          <Button color="error" onClick={() => removeWhere(idx)} sx={{ minWidth: "auto", p: 0.5, fontWeight: "bold" }}>
                            ✕
                          </Button>
                        </Grid>
                      </Grid>
                    ))
                  )}
                </Box>
              </Grid>
            )}

            {/* GROUP BY Clause */}
            {ir.type === "SELECT" && (
              <Grid item xs={12} md={6}>
                <Box sx={{ p: 3, bgcolor: "#f8fafc", borderRadius: 4, border: "1px solid #e2e8f0", minHeight: 160 }}>
                  <Typography variant="subtitle2" fontWeight="800" color="text.secondary" sx={{ letterSpacing: 0.5, textTransform: "uppercase", mb: 2 }}>
                    📊 GROUP BY
                  </Typography>
                  <TextField fullWidth label="Group By Columns (comma separated)" 
                    value={(ir.groupBy || []).join(", ")}
                    onChange={(e) => {
                      const fields = e.target.value.split(",").map(f => f.trim()).filter(Boolean);
                      setIr({ ...ir, groupBy: fields });
                    }}
                    placeholder="e.g. role, status"
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 3, bgcolor: "#fff" } }} />
                </Box>
              </Grid>
            )}

            {/* HAVING Clause */}
            {ir.type === "SELECT" && (
              <Grid item xs={12} md={6}>
                <Box sx={{ p: 3, bgcolor: "#f8fafc", borderRadius: 4, border: "1px solid #e2e8f0", minHeight: 220 }}>
                  <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                    <Typography variant="subtitle2" fontWeight="800" color="text.secondary" sx={{ letterSpacing: 0.5, textTransform: "uppercase" }}>
                      📈 HAVING (FILTER AGGREGATES)
                    </Typography>
                    <Button size="small" variant="outlined" onClick={addHaving} sx={{ borderRadius: 2, textTransform: "none", fontWeight: "bold" }}>
                      + Add Aggregate Filter
                    </Button>
                  </Stack>
                  {(ir.having || []).length === 0 ? (
                    <Typography variant="body2" color="text.secondary" sx={{ py: 2, fontStyle: "italic" }}>
                      No aggregate filters. (Used with aggregate functions like COUNT, SUM, etc).
                    </Typography>
                  ) : (
                    (ir.having || []).map((cond, idx) => (
                      <Grid container spacing={1.5} alignItems="center" key={idx} sx={{ mb: 1.5 }}>
                        {idx > 0 && (
                          <Grid item xs={12} md={2}>
                            <TextField select fullWidth size="small" value={cond.logic || "AND"} 
                              onChange={(e) => updateHavingLogic(idx, e.target.value)}
                              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}>
                              <MenuItem value="AND">AND</MenuItem>
                              <MenuItem value="OR">OR</MenuItem>
                            </TextField>
                          </Grid>
                        )}
                        <Grid item xs={12} md={idx > 0 ? 3 : 4}>
                          <TextField fullWidth size="small" label="Aggregate" value={cond.field || ""} 
                            onChange={(e) => updateHavingField(idx, e.target.value)} placeholder="COUNT(*)"
                            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }} />
                        </Grid>
                        <Grid item xs={12} md={3}>
                          <TextField select fullWidth size="small" label="Operator" value={cond.operator || "="} 
                            onChange={(e) => updateHavingOperator(idx, e.target.value)}
                            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}>
                            <MenuItem value="=">Equals (=)</MenuItem>
                            <MenuItem value=">">Greater Than (&gt;)</MenuItem>
                            <MenuItem value="<">Less Than (&lt;)</MenuItem>
                            <MenuItem value=">=">Greater or Equal (&gt;=)</MenuItem>
                            <MenuItem value="<=">Less or Equal (&lt;=)</MenuItem>
                          </TextField>
                        </Grid>
                        <Grid item xs={12} md={idx > 0 ? 3 : 4}>
                          <TextField fullWidth size="small" label="Value" value={cond.value || ""} 
                            onChange={(e) => updateHavingValue(idx, e.target.value)} placeholder="5"
                            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }} />
                        </Grid>
                        <Grid item xs={12} md={1} sx={{ display: "flex", justifyContent: "center" }}>
                          <Button color="error" onClick={() => removeHaving(idx)} sx={{ minWidth: "auto", p: 0.5, fontWeight: "bold" }}>
                            ✕
                          </Button>
                        </Grid>
                      </Grid>
                    ))
                  )}
                </Box>
              </Grid>
            )}

            {/* Insert / Update Payload */}
            {(ir.type === "INSERT" || ir.type === "UPDATE") && (
              <Grid item xs={12}>
                <Box sx={{ p: 3, bgcolor: "#fffbeb", borderRadius: 4, border: "1px solid #fef3c7" }}>
                  <Typography variant="subtitle2" fontWeight="800" color="#b45309" sx={{ mb: 1, textTransform: "uppercase", letterSpacing: 0.5 }}>
                    📝 Query Payload Values
                  </Typography>
                  <TextField fullWidth label="Values (Format: column1=value1, column2=value2)" value={valuesText}
                    onChange={(e) => setValuesText(e.target.value)} 
                    placeholder="name=John Doe, email=john@example.com, age=30"
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 3, bgcolor: "#fff" } }} />
                </Box>
              </Grid>
            )}

            {/* Pagination & Sorting */}
            {ir.type === "SELECT" && (
              <>
                <Grid item xs={12}>
                  <Box sx={{ p: 3, bgcolor: "#f8fafc", borderRadius: 4, border: "1px solid #e2e8f0" }}>
                    <Typography variant="subtitle2" fontWeight="800" color="text.secondary" sx={{ letterSpacing: 0.5, textTransform: "uppercase", mb: 2 }}>
                      📋 SORT & LIMIT CLAUSES
                    </Typography>
                    
                    <Stack spacing={2} sx={{ mb: 3 }}>
                      {(ir.orderBy || []).map((o, idx) => (
                        <Stack direction="row" spacing={2} alignItems="center" key={idx}>
                          <TextField fullWidth size="small" label={`Sort Column ${idx + 1}`} value={o.field}
                            onChange={(e) => updateOrderByField(idx, e.target.value)}
                            placeholder="e.g. created_at"
                            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2.5 } }} />
                          <TextField select size="small" label="Order" value={o.direction}
                            onChange={(e) => updateOrderByDirection(idx, e.target.value)}
                            sx={{ minWidth: 140, "& .MuiOutlinedInput-root": { borderRadius: 2.5 } }}>
                            <MenuItem value="ASC">ASC (A-Z)</MenuItem>
                            <MenuItem value="DESC">DESC (Z-A)</MenuItem>
                          </TextField>
                          <Button color="error" onClick={() => removeOrderBy(idx)} sx={{ fontWeight: "bold" }}>Remove</Button>
                        </Stack>
                      ))}
                    </Stack>
                    
                    <Grid container spacing={3} alignItems="center">
                      <Grid item xs={12} sm={4}>
                        <Button variant="outlined" size="small" onClick={addOrderBy} sx={{ borderRadius: 2, py: 1, textTransform: "none", fontWeight: "bold" }}>
                          + Add Sort Column
                        </Button>
                      </Grid>
                      <Grid item xs={6} sm={4}>
                        <TextField fullWidth size="small" type="number" label="Max Results (LIMIT)" value={ir.limit}
                          onChange={(e) => setIr({ ...ir, limit: Number(e.target.value) })}
                          sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2.5 } }} />
                      </Grid>
                      <Grid item xs={6} sm={4}>
                        <TextField fullWidth size="small" type="number" label="Skip Rows (OFFSET)" value={ir.offset}
                          onChange={(e) => setIr({ ...ir, offset: Number(e.target.value) })}
                          sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2.5 } }} />
                      </Grid>
                    </Grid>

                    <Box sx={{ mt: 3, display: "flex", alignItems: "center" }}>
                      <FormControlLabel 
                        control={<Switch checked={ir.distinct} onChange={(e) => setIr({ ...ir, distinct: e.target.checked })} color="primary" />} 
                        label={<Typography variant="body2" fontWeight="600">Remove Duplicated Rows (DISTINCT)</Typography>} 
                      />
                    </Box>
                  </Box>
                </Grid>
              </>
            )}
          </Grid>

          {/* Action Row */}
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mt: 5, justifyContent: "center" }}>
            <Button variant="contained" size="large" onClick={execute} 
              sx={{ 
                py: 1.75, 
                px: 5, 
                borderRadius: 3.5, 
                fontWeight: "900",
                textTransform: "none",
                fontSize: "1.05rem",
                letterSpacing: 0.5,
                background: "linear-gradient(90deg, #1e3a8a, #3b82f6)",
                boxShadow: "0 8px 25px rgba(59, 130, 246, 0.25)",
                "&:hover": {
                  background: "linear-gradient(90deg, #1e3a8a, #1d4ed8)",
                  boxShadow: "0 12px 30px rgba(59, 130, 246, 0.35)"
                }
              }}>
              ⚡ EXECUTE QUERY
            </Button>
            
            <Button variant="contained" color="secondary" size="large" onClick={() => setSaveDialogOpen(true)} 
              sx={{ 
                py: 1.75, 
                px: 5, 
                borderRadius: 3.5, 
                fontWeight: "900",
                textTransform: "none",
                fontSize: "1.05rem",
                letterSpacing: 0.5,
                background: "linear-gradient(90deg, #10b981, #059669)",
                boxShadow: "0 8px 25px rgba(16, 185, 129, 0.25)",
                "&:hover": {
                  background: "linear-gradient(90deg, #059669, #047857)",
                  boxShadow: "0 12px 30px rgba(16, 185, 129, 0.35)"
                }
              }}>
              💾 SAVE QUERY
            </Button>

            <Button variant="outlined" size="large" onClick={() => { setIr(defaultIr); setValuesText(""); }} 
              sx={{ 
                py: 1.75, 
                px: 5, 
                borderRadius: 3.5, 
                textTransform: "none",
                fontWeight: "bold",
                color: "text.secondary",
                borderColor: "#cbd5e1",
                "&:hover": {
                  borderColor: "#94a3b8",
                  bgcolor: "rgba(0,0,0,0.02)"
                }
              }}>
              Reset Builder
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* Terminal Output for Query Results */}
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
              DATABASE_CONSOLE.log
            </Typography>
          </Stack>
          {result && (
            <Chip 
              label={result.error ? "FAILED" : (result.status === "PENDING" ? "PENDING APPROVAL" : "SUCCESS")} 
              color={result.error ? "error" : (result.status === "PENDING" ? "warning" : "success")} 
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
                color: result.error ? "#f87171" : "#38bdf8",
                lineHeight: 1.6,
                whiteSpace: "pre-wrap"
              }}>
                {JSON.stringify(result, null, 2)}
              </pre>
            ) : (
              <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", py: 5, color: "#475569" }}>
                <Typography variant="body1" sx={{ fontFamily: "monospace", mb: 1 }}>
                  &gt; Waiting for query execution...
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: "monospace", fontSize: "0.8rem" }}>
                  Select an action type, specify columns/tables, and press Execute.
                </Typography>
              </Box>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Save Dialog */}
      <Dialog open={saveDialogOpen} onClose={() => setSaveDialogOpen(false)}
        PaperProps={{
          sx: { borderRadius: 4, p: 1 }
        }}>
        <DialogTitle sx={{ fontWeight: "bold" }}>Save Query Template</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Provide a custom name for this visual builder layout so you can load it later.
          </Typography>
          <TextField autoFocus margin="dense" label="Query Template Name" fullWidth value={queryName} 
            onChange={(e) => setQueryName(e.target.value)}
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2.5 } }} />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setSaveDialogOpen(false)} sx={{ color: "text.secondary", fontWeight: "bold" }}>
            Cancel
          </Button>
          <Button onClick={saveQuery} variant="contained" sx={{ borderRadius: 2.5, px: 3, fontWeight: "bold", bgcolor: "#1e3a8a" }}>
            Save Query
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}

