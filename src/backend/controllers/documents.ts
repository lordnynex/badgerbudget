import { Elysia } from "elysia";
import { BaseController } from "./BaseController";
import { DocumentsDto } from "../dto/documents.dto";
import { tiptapJsonToPdf } from "../lib/tiptapToPdf";

export class DocumentsController extends BaseController {
  init() {
    return new Elysia({ prefix: "/documents" })
      .get("/:id", ({ params }) => this.get(params.id), {
        params: DocumentsDto.params,
      })
      .get("/:id/pdf", ({ params }) => this.exportPdf(params.id), {
        params: DocumentsDto.params,
      })
      .patch("/:id", ({ params, body }) => this.update(params.id, body), {
        params: DocumentsDto.params,
        body: DocumentsDto.updateBody,
      })
      .get("/:id/versions", ({ params }) => this.listVersions(params.id), {
        params: DocumentsDto.params,
      })
      .get("/:id/versions/:vid", ({ params }) => this.getVersion(params.id, params.vid), {
        params: DocumentsDto.idVid,
      })
      .post("/:id/restore", ({ params, body }) => this.restore(params.id, body), {
        params: DocumentsDto.params,
        body: DocumentsDto.restoreBody,
      });
  }

  private get(id: string) {
    return this.api.documents.get(id).then((d) => (d ? this.json(d) : this.notFound()));
  }

  private async exportPdf(id: string) {
    const doc = await this.api.documents.get(id);
    if (!doc) return this.notFound();
    const pdfBuffer = tiptapJsonToPdf(doc.content);
    return new Response(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="document-${id}.pdf"`,
      },
    });
  }

  private update(id: string, body: { content: string }) {
    return this.api.documents.update(id, body).then((d) => (d ? this.json(d) : this.notFound()));
  }

  private listVersions(id: string) {
    return this.api.documents.listVersions(id).then(this.json);
  }

  private getVersion(id: string, vid: string) {
    const asNum = parseInt(vid, 10);
    const versionIdOrNum = Number.isNaN(asNum) ? vid : asNum;
    return this.api.documents
      .getVersion(id, versionIdOrNum)
      .then((v) => (v ? this.json(v) : this.notFound()));
  }

  private restore(id: string, body: { version_id?: string; version_number?: number }) {
    return this.api.documents
      .restore(id, body.version_id, body.version_number)
      .then((d) => (d ? this.json(d) : this.notFound()));
  }
}
