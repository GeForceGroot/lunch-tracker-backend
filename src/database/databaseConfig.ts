// Database Config

import mongoose from "mongoose";
import EnvConfig from "../common/envConfig";


class DataBaseConfig {
  private mongoConnection: mongoose.Connection | null = null;

  constructor(private envConfig: EnvConfig) {
    // MongoDB connection will be established when needed
  }

  connectToMongoDB = async (): Promise<mongoose.Connection | null> => {
    try {
      const mongoUri = this.envConfig.MONGODB_URI || 'mongodb://localhost:27017/lunch-scan';

      await mongoose.connect(mongoUri, {
        // MongoDB connection options
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });

      this.mongoConnection = mongoose.connection;

      this.mongoConnection.on('connected', () => {
        console.log('MongoDB connected successfully');
      });

      this.mongoConnection.on('error', (error) => {
        console.error('MongoDB connection error:', error);

      });

      this.mongoConnection.on('disconnected', () => {
        console.log('MongoDB disconnected');
      });

      return this.mongoConnection;
    } catch (error) {

      console.error("Failed to connect to MongoDB:", error);
      throw error;
    }
  };

  checkMongoDBConnection = async (): Promise<boolean> => {
    try {
      if (!this.mongoConnection) {
        await this.connectToMongoDB();
      }

      // Check if connection is ready
      if (this.mongoConnection && this.mongoConnection.readyState === 1) {
        console.log("Connection Successful With MongoDB");

        // List all collections in the database
        const collections = await this.mongoConnection.db?.listCollections().toArray() || [];
        console.log("Collections in your MongoDB:", collections.map((col: { name: string }) => col.name));

        return true;
      } else {
        console.log("MongoDB connection is not ready. State:", this.mongoConnection?.readyState);
        return false;
      }
    } catch (error) {
      console.error("Failed to check MongoDB connection:", error);
      return false;
    }
  };

  disconnectFromMongoDB = async (): Promise<void> => {
    try {
      if (this.mongoConnection) {
        await mongoose.disconnect();
        console.log("Disconnected from MongoDB");
      }
    } catch (error) {
      console.error("Failed to disconnect from MongoDB:", error);
    }
  };

  getMongoConnection = (): mongoose.Connection | null => {
    return this.mongoConnection;
  };
}

export default DataBaseConfig;