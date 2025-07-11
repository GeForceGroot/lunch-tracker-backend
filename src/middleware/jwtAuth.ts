// jwtMiddleware.ts

import { Request, Response, NextFunction } from "express";
import jwt, { VerifyErrors } from "jsonwebtoken";
import EnvConfig from "../common/envConfig";

interface TokenData {
    adminId: string;
    email: string;
    name: string;
    role: string;
    iat: number;
    exp: number;
}

declare global {
    namespace Express {
        interface Request {
            tokenData?: TokenData;
            adminId?: string;
        }
    }
}

export const jwtMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        // Get the token from the request headers
        const token = req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(401).json({ 
                success: false,
                message: "Access token is required" 
            });
        }

        // Verify the token
        const envConfig = new EnvConfig();
        const jwtSecret = envConfig.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
        
        const decoded = jwt.verify(token, jwtSecret) as TokenData;
        
        // Check if token is expired
        if (decoded.exp && Date.now() >= decoded.exp * 1000) {
            return res.status(401).json({ 
                success: false,
                message: "Token has expired" 
            });
        }

        // Add token data to request
        req.tokenData = decoded;
        req.adminId = decoded.adminId;

        // Call the next middleware
        next();
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            return res.status(401).json({ 
                success: false,
                message: "Invalid token" 
            });
        } else if (error instanceof jwt.TokenExpiredError) {
            return res.status(401).json({ 
                success: false,
                message: "Token has expired" 
            });
        } else {
            return res.status(500).json({ 
                success: false,
                message: "Token verification failed" 
            });
        }
    }
};

// Optional middleware for routes that can work with or without authentication
export const optionalJwtMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];

        if (token) {
            const envConfig = new EnvConfig();
            const jwtSecret = envConfig.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
            
            const decoded = jwt.verify(token, jwtSecret) as TokenData;
            
            if (decoded.exp && Date.now() < decoded.exp * 1000) {
                req.tokenData = decoded;
                req.adminId = decoded.adminId;
            }
        }

        next();
    } catch (error) {
        // Continue without authentication if token is invalid
        next();
    }
};
