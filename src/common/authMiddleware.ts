// authMiddleware.ts

import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from 'jsonwebtoken';
import EnvConfig from "./envConfig";
import axios from "axios";
import { generateErrorResponse } from "../utils/responseUtils";


const envConfig = new EnvConfig();


export const authMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
        const authHeader = req.headers['authorization'];
        const securityToken = req.headers['orchestrator_security_token'];
        if (authHeader) {
            const parts = authHeader.split(' ');
            if (parts.length > 2) {
                return res.status(401).send({ message: "Invalid Token!" });
            }

            const token = authHeader.split(' ')[1];

            if (!token) {
                return res.status(401).send({ message: "Unauthorized!" });
            }


            if (isTokenExpired(token)) {
                return res.status(401).send({ message: "Token Expired!" });
            }

            return next(); // Call next if token is valid
        }
        return res.status(401).send({ message: "Unauthorized!" });

    } catch (error: any) {
        if (error.statusCode == 401) {
            return res.status(error.statusCode).send({ message: error.message })
        }
        return res.status(500).send({ message: "Internal Server Error", error: error });
    }
};

export const checkUserId = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
        const authHeader = req.headers['authorization'];
        if (authHeader) {
            const token = authHeader.split(' ')[1];
            const userId: string = decodeToken(token).sub;
            if (req.body.userId !== userId) {
                return res.status(400).send({ message: "Bad Request!" });
            } else {
                return next(); // Call next if token is valid
            }
        } else {
            return res.status(401).send({ message: "Unauthorized!" });
        }
    } catch (error: any) {
        if (error.statusCode == 401) {
            return res.status(error.statusCode).send({ message: error.message })
        }
        return res.status(500).send({ message: "Internal Server Error", error: error });
    }
}
export const tokenMetaData = () => {
    return async (req: Request, res: Response, next: NextFunction) => {

        const authHeader: any = req.headers['authorization']
        const securityToken = req.headers['orchestrator_security_token']
        if (authHeader) {
            try {
                const token = authHeader.split(' ')[1]
                const decodedToken: any = decodeToken(token)

                if (!isTokenExpired(token)) {
                    req.body.createdBy = decodedToken.preferred_username;
                    req.body.createdByName = decodedToken.name
                }
                else {
                    return res.status(401).send({ message: "Token expired!" })
                }
                next()
            } catch (error) {
                console.error('Error decoding token:', error)
                return res.sendStatus(401)
            }
        }
        else if (securityToken) {
            req.body.createdBy = "agent-platform-lambda"
            req.body.createdByName = "agent-platform-lambda"
            next()
        }
    };

};

export const decodeToken = (token: any) => {
    const decodedToken: any = jwt.decode(token);
    return decodedToken;
}

export const isTokenExpired = (token: any) => {
    const decodedToken: any = decodeToken(token);
    if (decodedToken == null) {
        const error: any = new Error("Invalid Token");
        error.statusCode = 401; // Custom status code
        throw error;
    }
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const isTokenExpired = currentTimestamp >= decodedToken.exp
    return isTokenExpired
}

