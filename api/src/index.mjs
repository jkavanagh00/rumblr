import app from "./app.mjs";
  
app.use("/api", apiRouter);
app.listen(process.env.PORT, () => {
  console.log(`API listening on port ${process.env.PORT}`);
});
