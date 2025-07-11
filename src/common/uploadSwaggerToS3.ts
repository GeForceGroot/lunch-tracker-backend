import AWS from "aws-sdk";
import fs from 'fs';
import path from 'path';
import EnvConfig from "../common/envConfig";


class SwaggerConfig {


    constructor(private envConfig: EnvConfig) {

    }
}



export default SwaggerConfig;