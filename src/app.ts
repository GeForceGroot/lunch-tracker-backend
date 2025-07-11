import cors from 'cors';
import dotenv from 'dotenv';
import express, { Request, Response, Router } from 'express';
import { Container } from 'inversify';
import { authMiddleware } from './common/authMiddleware';
import EnvConfig from './common/envConfig';
import UserService from './services/userService';
import IUserService from './interface/userInterface';
import UsersController from './controllers/userController';
import { UserRoute } from './routes/userRoute';
import { AuthRoute } from './routes/authRoute';
import { ProtectedRoute } from './routes/protectedRoute';
import DataBaseConfig from './database/databaseConfig';

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;
const route = Router();

app.use(
    cors({
        exposedHeaders: ['X-Message-ID'],
    })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const container = new Container();
const envConfig = new EnvConfig();
const dbConfig = new DataBaseConfig(envConfig);


// User Data Routes
container.bind<IUserService>('IUserService').to(UserService);
const userService = container.get<IUserService>('IUserService');
const userController = new UsersController(userService);
const userRouteInstance = new UserRoute(userController);
app.use('/admin', userRouteInstance.getRouter());

// Authentication Routes
const authRouteInstance = new AuthRoute();
app.use('/auth', authRouteInstance.getRouter());

// Protected Routes (require JWT authentication)
const protectedRouteInstance = new ProtectedRoute();
app.use('/protected', protectedRouteInstance.getRouter());


// Get Verion of Product
app.get('/', (req: Request, res: Response) => {
    res.send('Version 1.0.0');
});
// Health Check API
app.get('/health-check', authMiddleware, (req: Request, res: Response) => {
    res.send('API Running!');
});


// To check the Database connection
dbConfig.checkMongoDBConnection();

app.listen(port, async () => {
    console.log(`Server is running on port ${port}`);
});

export { app, container };
