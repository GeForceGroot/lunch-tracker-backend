import { Request, Response, Router } from "express";
import UserController from "../controllers/userController";
import { authMiddleware } from "../common/authMiddleware";
import { jwtMiddleware } from "../middleware/jwtAuth";
import multer from 'multer';
import xlsx from 'xlsx';
import User from '../models/user';
const upload = multer({ dest: 'uploads/' });


class UserRoute {
    private readonly router: Router;
    private readonly userController: UserController;

    constructor(userController: UserController) {
        this.router = Router();
        this.userController = userController;
        this.configureRoutes();
    }

    configureRoutes() {

        // Get All Users 
        this.router.get('/getAllUsers', jwtMiddleware, (req: Request, res: Response) => this.userController.getAllUsers(req, res));
        // Update Status For User
        this.router.post('/updateUserStatus', jwtMiddleware, (req: Request, res: Response) => this.userController.updateUserStatus(req, res));
        // Upload Excel
        this.router.post('/upload-excel', jwtMiddleware, upload.single('file'), (req: Request, res: Response) => this.userController.uploadExcel(req, res));
        // Generate QR
        this.router.post('/generate-qr', jwtMiddleware, (req: Request, res: Response) => this.userController.generateQR(req, res));

    }

    getRouter(): Router {
        return this.router;
    }
}

export { UserRoute }