import {
    generateErrorResponse,
    generateSuccessResponse,
} from "../utils/responseUtils";
import { injectable } from "inversify";
import EnvConfig from "../common/envConfig";
import IUserService from "../interface/userInterface";
import { validateRequiredFields } from "../utils/validationUtils";
import DatabaseService from "../database/databaseService";
import xlsx from 'xlsx';
import User from '../models/user';
import qrcode from 'qrcode';
import AuthService from './authService';

@injectable()
class UserService implements IUserService {
    public envConfig = new EnvConfig();
    public databaseService = new DatabaseService();
    constructor() { }

    /// Get All Users
    getAllUsers = async (requestObject: any): Promise<any> => {
        try {
            // Fetch all users from the database
            const users = await User.find({}, {
                _id: 0, // Exclude MongoDB _id
                empId: 1,
                firstName: 1,
                lastName: 1,
                isEligibleForLunch: 1,
                status: 1
            }).lean();

            // Format response for frontend UI
            const formattedUsers = users.map(user => ({
                empId: user.empId,
                firstName: user.firstName,
                lastName: user.lastName,
                isEligibleForLunch: user.isEligibleForLunch,
                status: user.status || 'Not Scanned'
            }));

            return await generateSuccessResponse(formattedUsers, 'Users fetched successfully');
        } catch (error: any) {
            if (error.statusCode === 404) {
                return await generateErrorResponse(404, error.message);
            }
            return await generateErrorResponse(500, error.message);
        }
    };

    updateUserStatus = async (requestObject: any): Promise<any> => {
        try {
            const { empId } = requestObject.body || {};
            if (!empId) {
                return await generateErrorResponse(400, 'empId is required');
            }

            // Find the user first
            const user = await User.findOne({ empId: empId });
            if (!user) {
                return await generateErrorResponse(404, 'User not found');
            }

            // Check if user is eligible for lunch
            if (!user.isEligibleForLunch) {
                return await generateErrorResponse(403, 'User is not eligible for lunch');
            }

            // If already attended, mark as Duplicated
            if (user.status === 'Attended') {
                await User.updateOne(
                    { empId: empId },
                    { $set: { status: 'Duplicated' } }
                );
                return await generateSuccessResponse(null, 'User has already attended. Marked as Duplicated.');
            }
            if (user.status === 'Duplicated') {
                return await generateErrorResponse(409, 'User has already attended. Marked as Duplicated.');
            }

            // Otherwise, mark as Attended
            await User.updateOne(
                { empId: empId },
                { $set: { status: 'Attended' } }
            );

            return await generateSuccessResponse(null, 'User status updated to Attended');
        } catch (error: any) {
            if (error.statusCode === 404) {
                return await generateErrorResponse(404, error.message);
            }
            return await generateErrorResponse(500, error.message);
        }
    };

    uploadExcel = async (requestObject: any): Promise<any> => {
        try {
            if (!requestObject.file || !requestObject.file.path) {
                return await generateErrorResponse(400, "No file uploaded.");
            }
            const filePath = requestObject.file.path;
            const workbook = xlsx.readFile(filePath);
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const data = xlsx.utils.sheet_to_json(sheet);

            let imported = 0;
            for (const row of data as Record<string, any>[]) {
                let status = 'Not Scanned';
                if (row['Select Menu']?.toString().toLowerCase() === 'yes') {
                    // If there is a Scan Time, mark as Attended
                    if (row['Scan Time'] && row['Scan Time'].toString().trim() !== '-') {
                        status = 'Attended';
                    } else {
                        status = 'Not Scanned';
                    }
                }
                // If status is duplicate, check for a 'Duplicate' or similar column or logic
                if (row['Status']?.toString().toLowerCase() === 'duplicate') {
                    status = 'Duplicated';
                }
                await User.updateOne(
                    { empId: row['EMP Id'] },
                    {
                        $set: {
                            empId: row['EMP Id'],
                            firstName: row['First Name'],
                            lastName: row['Last Name'],
                            isEligibleForLunch: row['Select Menu']?.toString().toLowerCase() === 'yes',
                            status: status,
                        },
                    },
                    { upsert: true }
                );
                imported++;
            }
            return await generateSuccessResponse('', `Imported ${imported} users.`)
        } catch (err) {
            const message = err instanceof Error ? err.message : 'An unknown error occurred.';
            return await generateErrorResponse(500, message);
        }
    };

    generateQR = async (requestObject: any): Promise<any> => {
        try {
            const { empId, name, email } = requestObject.body || {};
            if (!empId || !name || !email) {
                return await generateErrorResponse(400, 'empId, name, and email are required');
            }

            // Generate QR data (could be a JSON string or a URL, here using JSON)
            const qrData = JSON.stringify({ empId, name, email });
            // Generate QR as a buffer
            const qrBuffer = await qrcode.toBuffer(qrData);

            // Food-themed HTML email template with inline image (cid:qrimage)
            const emailHtml = `
                <div style="font-family: 'Segoe UI', Arial, sans-serif; background: linear-gradient(145deg, #fffbe6, #ffe0b2); padding: 32px; border-radius: 18px; max-width: 520px; margin: 0 auto; box-shadow: 0 4px 18px rgba(255,153,0,0.2);">
  <h2 style="color: #f57c00; text-align: center; margin-bottom: 10px;">🍱 Lunch QR Check-In</h2>

  <p style="color: #444; text-align: center; font-size: 18px;">
    Hello <b>${name}</b>,<br />
    Your lunch QR code is ready! Just scan it at the counter.
  </p>

  <!-- Centered QR code using table for email compatibility -->
  <table role="presentation" width="100%" style="margin: 24px 0;">
    <tr>
      <td align="center">
        <div style="background: #ffffff; padding: 20px; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); display: inline-block;">
          <img src="cid:qrimage" alt="QR Code" style="width: 200px; height: 200px; display: block;" />
        </div>
      </td>
    </tr>
  </table>

  <div style="background: #fff8e1; border-left: 4px solid #ffb300; border-radius: 10px; padding: 16px; margin-bottom: 20px;">
    <p style="margin: 0; color: #f57c00; font-weight: 600;">👤 Employee ID: <span style="color: #333;">${empId}</span></p>
    <p style="margin: 0; color: #f57c00; font-weight: 600;">📧 Email: <span style="color: #333;">${email}</span></p>
  </div>

  <p style="color: #666; text-align: center; font-size: 15px;">
    Please present this QR code at the lunch counter.<br />
    Bon appétit! 🍲✨
  </p>

  <div style="text-align: center; margin-top: 24px;">
    <span style="font-size: 13px; color: #bbb;">Lunch QR System &copy; ${new Date().getFullYear()}</span>
  </div>
</div>
            `;

            // Use a new EnvConfig instance for SMTP config
            const envConfig = new EnvConfig();
            const subject = 'Your Lunch Scan QR Code';
            const nodemailer = require('nodemailer');
            const transporter = nodemailer.createTransport({
                host: envConfig.SMTP_HOST || 'smtp.gmail.com',
                port: parseInt(envConfig.SMTP_PORT || '587'),
                secure: false,
                auth: {
                    user: envConfig.SMTP_USER || '',
                    pass: envConfig.SMTP_PASS || ''
                }
            });
            const mailOptions = {
                from: envConfig.SMTP_FROM || '"Lunch Scan" <noreply@lunchscan.com>',
                to: email,
                subject: subject,
                html: emailHtml,
                attachments: [
                    {
                        filename: 'qrcode.png',
                        content: qrBuffer,
                        cid: 'qrimage'
                    }
                ]
            };
            const info = await transporter.sendMail(mailOptions);
            if (info && info.accepted && info.accepted.length > 0) {
                return await generateSuccessResponse(null, 'QR code generated and sent to email successfully.');
            } else {
                return await generateErrorResponse(500, 'Failed to send email.');
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : 'An unknown error occurred.';
            return await generateErrorResponse(500, message);
        }
    };
}

export default UserService;