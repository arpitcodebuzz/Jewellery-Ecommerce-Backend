

import dotenv from "dotenv";
import app from "./app.js";
dotenv.config();
const PORT = process.env.PORT || 5000;
const ProjectName = process.env.PROJECT_NAME


app.listen(PORT, () => {
  console.log(` ${ProjectName} server running on port ${PORT}`);
});



