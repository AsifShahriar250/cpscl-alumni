import type { Request, Response } from "express";

import { alumniDirectoryService } from "../services/alumni-directory.service.js";
import type {
  AlumniDirectoryQuery,
} from "../validators/alumni-directory.validator.js";

export async function getAlumniDirectory(
  _req: Request,
  res: Response,
): Promise<void> {
  const query =
    res.locals.alumniDirectoryQuery as AlumniDirectoryQuery;

  const result =
    await alumniDirectoryService.getDirectory(query);

  res.status(200).json({
    success: true,
    data: result,
  });
}
