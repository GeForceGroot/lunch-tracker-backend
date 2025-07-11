import { Router } from 'express';
import AuthController from '../controllers/authController';
import multer from 'multer';
import xlsx from 'xlsx';
import User from '../models/user';
import { jwtMiddleware } from '../middleware/jwtAuth';

class AuthRoute {
  private router: Router;
  private authController: AuthController;

  constructor() {
    this.router = Router();
    this.authController = new AuthController();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // Public routes (no authentication required)
    this.router.post('/signup', this.authController.signup);
    this.router.post('/login', this.authController.login);
    this.router.post('/forgot-password', this.authController.forgotPassword);
    this.router.post('/verify-token', this.authController.verifyToken);

    // Protected routes (authentication required)
    this.router.get('/profile', this.authController.getProfile);
  }

  public getRouter(): Router {
    return this.router;
  }
}

const upload = multer({ dest: 'uploads/' });
const router = Router();

// Make upload-excel API authorized
// router.post('/upload-excel', jwtMiddleware, upload.single('file'), async (req, res) => {
//   try {
//     if (!req.file || !req.file.path) {
//       return res.status(400).json({ success: false, message: 'No file uploaded.' });
//     }
//     const filePath = req.file.path;
//     const workbook = xlsx.readFile(filePath);
//     const sheet = workbook.Sheets[workbook.SheetNames[0]];
//     const data = xlsx.utils.sheet_to_json(sheet);

//     let imported = 0;
//     for (const row of data as Record<string, any>[]) {
//       if (
//         row['Select Menu']?.toString().toLowerCase() === 'yes'
//       ) {
//         // Adjust field names as per your model
//         await User.updateOne(
//           { empId: row['EMP Id'] },
//           {
//             $set: {
//               empId: row['EMP Id'],
//               firstName: row['First Name'],
//               lastName: row['Last Name'],
//               isEligibleForLunch: true,
//             },
//           },
//           { upsert: true }
//         );
//         imported++;
//       }
//     }
//     res.json({ success: true, message: `Imported ${imported} users.` });
//   } catch (err) {
//     const message = err instanceof Error ? err.message : 'An unknown error occurred.';
//     res.status(500).json({ success: false, message });
//   }
// });

export { AuthRoute };