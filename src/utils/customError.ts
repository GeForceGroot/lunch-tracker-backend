export default class CustomError extends Error {
    statusCode: number;
    status: string;

    constructor(message: string, statuscode: number) {
        super(message);
        this.name = this.constructor.name;
        this.statusCode = statuscode;
        this.status = statuscode >= 400 && statuscode < 500 ? "failed" : "error";
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, CustomError);
        }
    }
}