import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const swaggerDocument = YAML.load(
  path.join(__dirname, "../../../swagger/web/swagger.yaml")
);

export const swaggerSetupForWeb = (app) => {
  app.use(
    "/api-docs/web",
    swaggerUi.serveFiles(swaggerDocument),
    swaggerUi.setup(swaggerDocument, {
      customSiteTitle: "PULSED LABS WEB API DOCS",
    })
  );
};
