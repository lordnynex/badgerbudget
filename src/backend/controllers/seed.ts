import { api } from "../services/api";
import { json } from "./helpers";

export const seedController = {
  run: () => api.seed().then(json),
};
