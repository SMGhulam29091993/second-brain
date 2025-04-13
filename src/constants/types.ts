export interface UserDto{
    _id : string;
    username : string;
    email : string;
    password? : string;
    isEmailVerified : boolean;
    createdAt? : string;
    updatedAt? : string;
    __v? : number;
}