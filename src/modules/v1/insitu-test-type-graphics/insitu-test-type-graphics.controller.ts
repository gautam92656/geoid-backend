import type { Request, Response, NextFunction } from "express"
import fs from "fs"
import path from "path"
import { HTTP_STATUS } from "../../../shared/constants"
import { successResponse } from "../../../shared/utils/apiResponse"
import { NotFoundError } from "../../../shared/errors/NotFoundError"
import * as service from "./insitu-test-type-graphics.service"

export async function list(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await service.listInsituTestTypeGraphics()
    successResponse(res, data, "", HTTP_STATUS.OK)
  } catch (error) {
    next(error)
  }
}

export async function serveFile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const kindRaw = String(req.params.kind ?? "")
    const filename = String(req.params.filename ?? "")
    const kind: service.InsituGraphicKind | null =
      kindRaw === "test" || kindRaw === "top-bottom" ? kindRaw : null

    if (!kind) {
      throw new NotFoundError("Graphic kind not found")
    }

    const filePath = service.resolveGraphicFilePath(kind, filename)
    if (!filePath || !fs.existsSync(filePath)) {
      throw new NotFoundError("Graphic not found")
    }

    const ext = path.extname(filePath).toLowerCase()
    const contentType =
      ext === ".svg" ? "image/svg+xml" : ext === ".png" ? "image/png" : "application/octet-stream"

    res.setHeader("Cache-Control", "public, max-age=86400")
    res.setHeader("Content-Type", contentType)
    fs.createReadStream(filePath).pipe(res)
  } catch (error) {
    next(error)
  }
}
