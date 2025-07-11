import express from 'express';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import dotenv from 'dotenv';
import EnvConfig from './common/envConfig';


dotenv.config();

class Swagger {
    private app: express.Express;
    private swaggerDocument: any | null = null;

    constructor(private envConfig: EnvConfig) {
        this.app = express();

    }

    // Fetch Swagger YAML from S3
    private async getSwaggerYamlFromS3(): Promise<any> {
        try {

        } catch (error) {
            console.error('Error fetching Swagger YAML from S3:', error);
            return null;
        }
    }


    // Set dynamic server URL based on NODE_ENV
    // private getServerUrl(): { url: string; description: string }[] {
    //     const env = process.env.NODE_ENV || 'local';

    //     // const servers: Record<string, { url: string; description: string }> = {
    //     //     local: {
    //     //         url: this.envConfig.ENV_URL,
    //     //         description: 'Local development'
    //     //     },
    //     //     dev: {
    //     //         url: this.envConfig.ENV_URL,
    //     //         description: 'Developement server'
    //     //     },
    //     //     test: {
    //     //         url: this.envConfig.ENV_URL,
    //     //         description: 'Test server'
    //     //     }
    //     // };

    //     // return servers[env] ? [servers[env]] : [servers.development];
    // }

    // Set up Swagger dynamically and return the document
    public async setupSwagger(): Promise<any> {
        // const yamlContent = await this.getSwaggerYamlFromS3();
        // if (!yamlContent) {
        //     await logger.error({ message: 'Error uploading Swagger file:', error: new Error() });
        //     console.error('Failed to load Swagger YAML from S3');
        //     return null;
        // }

        // this.swaggerDocument = YAML.parse(yamlContent);

        // // Dynamically set servers based on environment
        // this.swaggerDocument.servers = this.getServerUrl();

        // return this.swaggerDocument; // Return the parsed Swagger document
    }

}

export default Swagger;
