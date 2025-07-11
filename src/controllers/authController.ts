import { Request, Response } from 'express';
import AuthService, { LoginRequest, SignupRequest, ForgotPasswordRequest } from '../services/authService';


class AuthController {
    private authService: AuthService;

    constructor() {
        this.authService = new AuthService();
    }

    // Admin Signup
    signup = async (req: Request, res: Response): Promise<void> => {
        try {
            const { email, name, password } = req.body;

            // Validation
            if (!email || !name || !password) {
                res.status(400).json({
                    success: false,
                    message: 'Email, name, and password are required'
                });
                return;
            }

            if (password.length < 6) {
                res.status(400).json({
                    success: false,
                    message: 'Password must be at least 6 characters long'
                });
                return;
            }

            const signupData: SignupRequest = {
                email: email.trim(),
                name: name.trim(),
                password: password
            };

            const result = await this.authService.signup(signupData);

            if (result.success) {
                res.status(201).json({
                    success: true,
                    message: result.message,
                    token: result.token,
                    admin: result.admin
                });
            } else {
                res.status(400).json({
                    success: false,
                    message: result.message
                });
            }

        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    };

    // Admin Login
    login = async (req: Request, res: Response): Promise<void> => {
        try {
            const { email, password } = req.body;

            // Validation
            if (!email || !password) {
                res.status(400).json({
                    success: false,
                    message: 'Email and password are required'
                });
                return;
            }

            const loginData: LoginRequest = {
                email: email.trim(),
                password: password
            };

            const result = await this.authService.login(loginData);

            if (result.success) {
                res.status(200).json({
                    success: true,
                    message: result.message,
                    token: result.token,
                    admin: result.admin
                });
            } else {
                res.status(401).json({
                    success: false,
                    message: result.message
                });
            }

        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    };

    // Forgot Password
    forgotPassword = async (req: Request, res: Response): Promise<void> => {
        try {
            const { email } = req.body;

            // Validation
            if (!email) {
                res.status(400).json({
                    success: false,
                    message: 'Email is required'
                });
                return;
            }

            const forgotData: ForgotPasswordRequest = {
                email: email.trim()
            };

            const result = await this.authService.forgotPassword(forgotData);

            if (result.success) {
                res.status(200).json({
                    success: true,
                    message: result.message
                });
            } else {
                res.status(400).json({
                    success: false,
                    message: result.message
                });
            }

        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    };

    // Verify Token (for testing/protected routes)
    verifyToken = async (req: Request, res: Response): Promise<void> => {
        try {
            const token = req.headers.authorization?.split(' ')[1];

            if (!token) {
                res.status(401).json({
                    success: false,
                    message: 'No token provided'
                });
                return;
            }

            const result = await this.authService.verifyToken(token);

            if (result.success) {
                res.status(200).json({
                    success: true,
                    message: 'Token is valid',
                    data: result.data
                });
            } else {
                res.status(401).json({
                    success: false,
                    message: result.message
                });
            }

        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    };

    // Get Current Admin Profile (protected route)
    getProfile = async (req: Request, res: Response): Promise<void> => {
        try {
            const token = req.headers.authorization?.split(' ')[1];

            if (!token) {
                res.status(401).json({
                    success: false,
                    message: 'No token provided'
                });
                return;
            }

            const tokenResult = await this.authService.verifyToken(token);

            if (!tokenResult.success) {
                res.status(401).json({
                    success: false,
                    message: 'Invalid token'
                });
                return;
            }

            const adminId = tokenResult.data.adminId;
            const admin = await this.authService.getAdminById(adminId);

            if (!admin) {
                res.status(404).json({
                    success: false,
                    message: 'Admin not found'
                });
                return;
            }

            res.status(200).json({
                success: true,
                message: 'Profile retrieved successfully',
                admin: {
                    uId: admin.uId,
                    email: admin.email,
                    name: admin.name,
                    isActive: admin.isActive,
                    lastLogin: admin.lastLogin,
                    createdOn: admin.createdOn
                }
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    };
}

export default AuthController; 