import type { Elysia } from "elysia";
import type { Api } from "../services/api";
import { json, notFound } from "./helpers";

export abstract class BaseController {
  constructor(protected api: Api) {}

  abstract init(): Elysia<any, any, any, any, any, any, any>;

  protected json = json;
  protected notFound = notFound;
}
