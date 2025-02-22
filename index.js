
const express = require('express');
const http = require('http');
const app = express();
const server = http.createServer(app);
const dotenv = require('dotenv').config();
const cors = require('cors')
const bodyParser = require('body-parser');


const corsOptions = {
  origin: '*', // Frontend origin
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

app.use(bodyParser.json({ limit: '1mb' }));
app.use(bodyParser.urlencoded({ limit: '1mb', extended: true }));

app.use(express.json());
      
const port = process.env.PORT || 5000;

app.use("/api/courses", require("./routes/courseRouter"))
app.use("/api/student", require("./routes/studentRouter"))
app.use("/api/admin", require("./routes/adminRoutes"))



server.listen(port, () => {
  console.log(`server is running on port ${port}`);
})