import { Request, Response, NextFunction } from "express";
import multer from 'multer';
import path from 'path';

export const checkFileValidation = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
        await uploadFilesAsync(req, res);
        next();
    } catch (err: any) {
        const message =
            err.message === "File too large"
                ? "File size exceeds 10MB limit."
                : err.message === "Invalid file type"
                    ? "Only PNG, JPG, PDF, and TXT files are allowed."
                    : err.message === "Unexpected field"
                        ? "you can upload only 3 files "
                        : "Error in file upload";
        return res.status(422).send(message);
    }
}

export const uploadFilesAsync = async (req: any, res: any): Promise<any> => {
    return new Promise<void>((resolve, reject) => {
        uploadFiles(req, res, (err: any) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

export const uploadFiles = multer({
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedExt = [".png", ".jpg", ".pdf", ".txt"];
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowedExt.includes(ext)) {

            cb(null, true);
        } else {
            cb(new Error("Invalid file type"));
        }
    },
}).array("files", 3);