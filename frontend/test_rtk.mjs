import { createAsyncThunk, configureStore } from '@reduxjs/toolkit';

const myThunk = createAsyncThunk('test', async (arg, { rejectWithValue }) => {
  return rejectWithValue({ my_field: ["Invalid stuff"] });
});

const store = configureStore({
  reducer: (state = {}, action) => state
});

async function run() {
  try {
    await store.dispatch(myThunk()).unwrap();
  } catch (err) {
    console.log("Caught:", typeof err);
    console.log("Is Error instance?", err instanceof Error);
    console.log("JSON.stringify:", JSON.stringify(err));
    console.log("Keys:", Object.keys(err));
    console.log("Message:", err.message);
  }
}

run();
