//  Conversation Controller

import { Request, Response } from "express";
import EnvConfig from "../common/envConfig"
import IUserService from "../interface/userInterface";
import { generateErrorResponse } from "../utils/responseUtils";

class UserController {
    public envConfig = new EnvConfig();
    constructor(private readonly userService: IUserService) { }

    getAllUsers = async (req: Request, res: Response): Promise<void> => {
        try {
            const result: any = await this.userService.getAllUsers(req);
            res.status(result.statusCode).send(result);
        } catch (error) {
            console.log("Exception in admin/getAllUsers:", error);
            res.status(500).json(await generateErrorResponse(500, "Error in Fetching All Users Data !"));
        }
    }


    updateUserStatus = async (req: Request, res: Response): Promise<void> => {
        try {
            const result: any = await this.userService.updateUserStatus(req);
            res.status(result.statusCode).send(result);
        } catch (error) {
            console.log("Exception in admin/updateUserStatus:", error);
            res.status(500).json(await generateErrorResponse(500, "Error in Updating Users Status!"));
        }
    }

    uploadExcel = async (req: Request, res: Response): Promise<void> => {
        try {
            const result: any = await this.userService.uploadExcel(req);
            res.status(result.statusCode).send(result);
        } catch (error) {
            console.log("Exception in admin/updateUserStatus:", error);
            res.status(500).json(await generateErrorResponse(500, "Error in Updating Users Status!"));
        }
    }

    generateQR = async (req: Request, res: Response): Promise<void> => {
        try {
            const result: any = await this.userService.generateQR(req);
            res.status(result.statusCode).send(result);
        } catch (error) {
            console.log("Exception in admin/updateUserStatus:", error);
            res.status(500).json(await generateErrorResponse(500, "Error in Updating Users Status!"));
        }
    }

}


export default UserController;
