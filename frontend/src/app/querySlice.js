import { createSlice } from "@reduxjs/toolkit";

const querySlice = createSlice({
  name: "query",
  initialState: {
    saved: [],
    latestResult: null,
  },
  reducers: {
    setSavedQueries: (state, action) => {
      state.saved = action.payload;
    },
    setLatestResult: (state, action) => {
      state.latestResult = action.payload;
    },
  },
});

export const { setSavedQueries, setLatestResult } = querySlice.actions;
export default querySlice.reducer;
