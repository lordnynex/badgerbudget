import { t } from "elysia";
import { CommonParams } from "./common";

export const DocumentsDto = {
  params: CommonParams.id,
  idVid: CommonParams.idVid,
  updateBody: t.Object({ content: t.String() }),
  restoreBody: t.Object({
    version_id: t.Optional(t.String()),
    version_number: t.Optional(t.Number()),
  }),
};
