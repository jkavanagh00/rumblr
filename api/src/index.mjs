

import express from "express";
import app from "./app.mjs";
  
const PORT = process.env.PORT || 3001;
app.listen(process.env.PORT, () => {
  console.log(`API listening on port ${process.env.PORT}`);
});
