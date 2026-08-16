import { docs } from "collections/server";
import { loader } from "fumadocs-core/source";

export const source = loader({
  source: docs.toFumadocsSource(),
  baseUrl: "/docs",
});
