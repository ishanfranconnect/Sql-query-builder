import { useEffect } from "react";
import { Button, Card, CardContent, Stack, Typography } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
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
    await api.delete(`/queries/${id}`);
    await load();
  };

  useEffect(() => { load(); }, []);

  return (
    <Card>
      <CardContent>
        <Typography variant="h4" gutterBottom>Saved Queries</Typography>
        <Stack spacing={2}>
          {saved.map((q) => (
            <Card key={q.id} variant="outlined">
              <CardContent>
                <Typography variant="h6">{q.name}</Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>{q.generatedSql}</Typography>
                <Button color="error" onClick={() => remove(q.id)}>Delete</Button>
              </CardContent>
            </Card>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}
