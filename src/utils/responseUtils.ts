interface SuccessResponse<T> {
    data: T;
    success: boolean;
    statusCode: number;
    message: string;
}

const generateSuccessResponse = async <T>(
    data: T,
    message = "Success"
): Promise<SuccessResponse<T>> => {
    return {
        message,
        statusCode: 200,
        success: true,
        data,
    };
};

const generateErrorResponse = async <T>(
    statusCode: number,
    message = "Error"
): Promise<SuccessResponse<null>> => {
    return {
        message,
        statusCode,
        success: false,
        data: null,
    };
};

export { generateSuccessResponse, generateErrorResponse };


