const express = require("express");
require("dotenv").config();

const authRouter = require("./router/authenticationRoutes");

const app = express();

app.use(express.json());

const port = process.env.PORT || 3000;

app.use("/", authRouter);

app.listen(port, console.log(`Server running on port ${port}`));
