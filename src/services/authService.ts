import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import { AdminModel, IAdmin } from '../models/admin';
import EnvConfig from '../common/envConfig';
import { initialize } from '../common/baseEntity';

export interface LoginRequest {
    email: string;
    password: string;
}

export interface SignupRequest {
    email: string;
    name: string;
    password: string;
}

export interface ForgotPasswordRequest {
    email: string;
}

export interface AuthResponse {
    success: boolean;
    message: string;
    token?: string;
    admin?: Partial<IAdmin>;
}

class AuthService {
    private envConfig: EnvConfig;
    private jwtSecret: string;

    constructor() {
        this.envConfig = new EnvConfig();
        this.jwtSecret = this.envConfig.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
    }

    // Generate JWT Token
    private generateToken(admin: IAdmin): string {
        const payload = {
            adminId: admin.uId,
            email: admin.email,
            name: admin.name,
            role: 'admin'
        };

        return jwt.sign(payload, this.jwtSecret, {
            expiresIn: '24h' // Token expires in 24 hours
        });
    }

    // Hash Password
    private async hashPassword(password: string): Promise<string> {
        const saltRounds = 12;
        return await bcrypt.hash(password, saltRounds);
    }

    // Compare Password
    private async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
        return await bcrypt.compare(password, hashedPassword);
    }

    // Generate Random Password
    private generateRandomPassword(): string {
        const length = 12;
        const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
        let password = "";
        for (let i = 0; i < length; i++) {
            password += charset.charAt(Math.floor(Math.random() * charset.length));
        }
        return password;
    }

    // Send Email
    private async sendEmail(to: string, subject: string, html: string): Promise<boolean> {
        try {
            // Create transporter using environment variables
            const transporter = nodemailer.createTransport({
                host: this.envConfig.SMTP_HOST || 'smtp.gmail.com',
                port: parseInt(this.envConfig.SMTP_PORT || '587'),
                secure: false, // true for 465, false for other ports
                auth: {
                    user: this.envConfig.SMTP_USER || '',
                    pass: this.envConfig.SMTP_PASS || ''
                }
            });

            // Send mail
            const info = await transporter.sendMail({
                from: this.envConfig.SMTP_FROM || '"Lunch Scan" <noreply@lunchscan.com>',
                to: to,
                subject: subject,
                html: html
            });

            return true;
        } catch (error) {
            return false;
        }
    }

    // Admin Signup
    async signup(signupData: SignupRequest): Promise<AuthResponse> {
        try {
            // Check if admin already exists
            const existingAdmin = await AdminModel.findOne({
                email: signupData.email.toLowerCase(),
                active: true,
                archived: false
            });

            if (existingAdmin) {
                return {
                    success: false,
                    message: 'Admin with this email already exists'
                };
            }

            // Hash password
            const hashedPassword = await this.hashPassword(signupData.password);

            // Create new admin
            const adminData = {
                email: signupData.email.toLowerCase(),
                name: signupData.name,
                password: hashedPassword,
                isActive: true
            };

            // Initialize with BaseEntity
            const initializedData = initialize(true, 'Admin', adminData);

            const newAdmin = new AdminModel(initializedData);
            await newAdmin.save();

            // Generate JWT token
            const token = this.generateToken(newAdmin);


            return {
                success: true,
                message: 'Admin signed up successfully',
                token: token,
                admin: {
                    uId: newAdmin.uId,
                    email: newAdmin.email,
                    name: newAdmin.name,
                    isActive: newAdmin.isActive
                }
            };

        } catch (error) {

            return {
                success: false,
                message: 'Internal server error during signup'
            };
        }
    }

    // Admin Login
    async login(loginData: LoginRequest): Promise<AuthResponse> {
        try {
            // Find admin by email
            const admin = await AdminModel.findOne({
                email: loginData.email.toLowerCase(),
                active: true,
                archived: false
            });

            if (!admin) {
                return {
                    success: false,
                    message: 'Invalid email or password'
                };
            }

            // Check if admin is active
            if (!admin.isActive) {
                return {
                    success: false,
                    message: 'Account is deactivated. Please contact administrator.'
                };
            }

            // Verify password
            const isPasswordValid = await this.comparePassword(loginData.password, admin.password);
            if (!isPasswordValid) {
                return {
                    success: false,
                    message: 'Invalid email or password'
                };
            }

            // Update last login
            admin.lastLogin = new Date();
            admin.updatedOn = new Date().toISOString();
            admin.version++;
            await admin.save();

            // Generate JWT token
            const token = this.generateToken(admin);


            return {
                success: true,
                message: 'Login successful',
                token: token,
                admin: {
                    uId: admin.uId,
                    email: admin.email,
                    name: admin.name,
                    isActive: admin.isActive,
                    lastLogin: admin.lastLogin
                }
            };

        } catch (error) {

            return {
                success: false,
                message: 'Internal server error during login'
            };
        }
    }

    // Forgot Password
    async forgotPassword(forgotData: ForgotPasswordRequest): Promise<AuthResponse> {
        try {
            // Find admin by email
            const admin = await AdminModel.findOne({
                email: forgotData.email.toLowerCase(),
                active: true,
                archived: false
            });

            if (!admin) {
                // Don't reveal if email exists or not for security
                return {
                    success: true,
                    message: 'If the email exists, a new password has been sent to your email address'
                };
            }

            // Generate new random password
            const newPassword = this.generateRandomPassword();
            const hashedPassword = await this.hashPassword(newPassword);

            // Update admin password
            admin.password = hashedPassword;
            admin.updatedOn = new Date().toISOString();
            admin.version++;
            await admin.save();

            // Send email with new password
            const emailSubject = 'Password Reset - Lunch Scan Admin';
            const emailHtml = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #fffdf3, #ffe9c6); padding: 32px; border-radius: 16px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);">

  <h2 style="color: #ff9800; text-align: center; margin-top: 0;">🔐 Password Reset Successful</h2>

  <p style="color: #333; font-size: 16px;">Hello <strong>${admin.name}</strong>,</p>

  <p style="color: #444; font-size: 15px;">
    Your password has been <strong>reset successfully</strong>. You can use the following temporary password to log in:
  </p>

  <div style="background-color: #fff3e0; padding: 16px; border-left: 4px solid #ffa726; border-radius: 8px; margin: 24px 0;">
    <p style="margin: 0; font-size: 18px; color: #e65100;">
      <strong>New Password:</strong> <span style="color: #000;">${newPassword}</span>
    </p>
  </div>

  <p style="color: #555; font-size: 14px;">
    <strong>Security Note:</strong> For your protection, please change this password immediately after logging in.
  </p>

  <p style="color: #777; font-size: 14px;">
    If you didn’t request this reset, please contact your administrator or support team right away.
  </p>

  <p style="color: #444; font-size: 15px;">
    Best regards,<br />
    🍽️ <strong>Lunch Scan Team</strong>
  </p>

  <div style="text-align: center; margin-top: 30px;">
    <small style="color: #bbb;">Lunch Scan System &copy; ${new Date().getFullYear()}</small>
  </div>
</div>
            `;

            const emailSent = await this.sendEmail(admin.email, emailSubject, emailHtml);

            if (emailSent) {

                return {
                    success: true,
                    message: 'New password has been sent to your email address'
                };
            } else {
                // Revert password if email failed
                admin.password = admin.password; // Keep old password
                admin.updatedOn = new Date().toISOString();
                admin.version++;
                await admin.save();

                return {
                    success: false,
                    message: 'Failed to send email. Please try again later.'
                };
            }

        } catch (error) {

            return {
                success: false,
                message: 'Internal server error during password reset'
            };
        }
    }

    // Verify JWT Token
    async verifyToken(token: string): Promise<any> {
        try {
            const decoded = jwt.verify(token, this.jwtSecret);
            return { success: true, data: decoded };
        } catch (error) {
            return { success: false, message: 'Invalid token' };
        }
    }

    // Get Admin by ID
    async getAdminById(adminId: string): Promise<IAdmin | null> {
        try {
            return await AdminModel.findOne({
                uId: adminId,
                active: true,
                archived: false
            });
        } catch (error) {
            return null;
        }
    }
}

export default AuthService; 