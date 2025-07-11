export default interface IUserService {
    getAllUsers(requestObject: any): Promise<any>;
    updateUserStatus(requestObject: any): Promise<any>;
    uploadExcel(requestObject: any): Promise<any>;
    generateQR(requestObject: any): Promise<any>;

}