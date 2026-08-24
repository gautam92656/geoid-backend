import type { Request, Response, NextFunction } from "express"
import fs from "fs"
import path from "path"
import { HTTP_STATUS } from "../../../shared/constants"
import { successResponse } from "../../../shared/utils/apiResponse"
import { NotFoundError } from "../../../shared/errors/NotFoundError"
import * as service from "./well-backfill-graphics.service"

export async function list(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const graphics = await service.listWellBackfillGraphics()
    successResponse(res, { graphics }, "", HTTP_STATUS.OK)
  } catch (error) {
    next(error)
  }
}

export async function serveFile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const filename = String(req.params.filename ?? "")
    const filePath = service.resolveGraphicFilePath(filename)
    if (!filePath || !fs.existsSync(filePath)) {
      throw new NotFoundError("Graphic not found")
    }

    const ext = path.extname(filePath).toLowerCase()
    const contentType =
      ext === ".svg"
        ? "image/svg+xml"
        : ext === ".png"
          ? "image/png"
          : ext === ".jpg" || ext === ".jpeg"
            ? "image/jpeg"
            : "application/octet-stream"

    res.setHeader("Cache-Control", "public, max-age=86400")
    res.setHeader("Content-Type", contentType)
    res.setHeader("Access-Control-Allow-Origin", "*")
    fs.createReadStream(filePath).pipe(res)
  } catch (error) {
    next(error)
  }
}
