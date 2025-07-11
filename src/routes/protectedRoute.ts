import { Router, Request, Response } from 'express';
import { jwtMiddleware } from '../middleware/jwtAuth';

class ProtectedRoute {
    private router: Router;

    constructor() {
        this.router = Router();
        this.initializeRoutes();
    }

    private initializeRoutes(): void {
        // Protected route example - requires JWT authentication
        this.router.get('/dashboard', jwtMiddleware, this.getDashboard);
        this.router.get('/admin-info', jwtMiddleware, this.getAdminInfo);
    }

    // Example protected endpoint
    private getDashboard = async (req: Request, res: Response): Promise<void> => {
        try {
            // Access admin data from JWT token
            const adminId = req.adminId;
            const tokenData = req.tokenData;

            res.status(200).json({
                success: true,
                message: 'Dashboard data retrieved successfully',
                data: {
                    adminId: adminId,
                    adminName: tokenData?.name,
                    adminEmail: tokenData?.email,
                    role: tokenData?.role,
                    dashboard: {
                        totalUsers: 150,
                        activeSessions: 25,
                        recentActivity: [
                            { action: 'User login', time: new Date().toISOString() },
                            { action: 'Password reset', time: new Date().toISOString() }
                        ]
                    }
                }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    };

    // Another protected endpoint example
    private getAdminInfo = async (req: Request, res: Response): Promise<void> => {
        try {
            const adminId = req.adminId;
            const tokenData = req.tokenData;

            res.status(200).json({
                success: true,
                message: 'Admin information retrieved successfully',
                data: {
                    adminId: adminId,
                    name: tokenData?.name,
                    email: tokenData?.email,
                    role: tokenData?.role,
                    permissions: ['read', 'write', 'delete'],
                    lastLogin: new Date().toISOString()
                }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    };

    public getRouter(): Router {
        return this.router;
    }
}

export { ProtectedRoute }; 