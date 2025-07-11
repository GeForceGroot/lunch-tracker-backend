//  Announcment DTO

class UsersDTO {
    employeeId: string;
    name: string;
    scanTime: string;

    constructor(props: UsersDTO) {
        this.employeeId = props.employeeId || ""
        this.name = props.name || ""
        this.scanTime = props.scanTime || ""

    }
}


export default UsersDTO;