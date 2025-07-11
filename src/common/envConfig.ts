import * as dotenv from 'dotenv';
import { injectable } from 'inversify';
dotenv.config();

@injectable()
class EnvConfig {

    public readonly MONGODB_URI: string;
    public readonly JWT_SECRET: string;
    public readonly SMTP_HOST: string;
    public readonly SMTP_PORT: string;
    public readonly SMTP_USER: string;
    public readonly SMTP_PASS: string;
    public readonly SMTP_FROM: string;

    constructor() {
        this.MONGODB_URI = process.env.MONGODB_URI || "";
        this.JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production";
        this.SMTP_HOST = process.env.SMTP_HOST || "smtp.gmail.com";
        this.SMTP_PORT = process.env.SMTP_PORT || "587";
        this.SMTP_USER = process.env.SMTP_USER || "";
        this.SMTP_PASS = process.env.SMTP_PASS || "";
        this.SMTP_FROM = process.env.SMTP_FROM || "noreply@lunchscan.com";
    }
}

export default EnvConfig;
