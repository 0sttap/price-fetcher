const express = require("express");
const router = require("./routes");

const app = express();
const port = 3000;

app.use("/api", router);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
