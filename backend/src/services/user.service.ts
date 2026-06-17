import {UserRepository} from "../repositories/user.repository"
import { AppError } from "../utils/AppError"

export class UserService{
    private repository = new UserRepository();

    async getUsers() {
        return await this.repository.findAll();
    }

    async getUserById(id:string){
        return await this.repository.findById(id);
    }

    async createUser(name :string , email:string){
        const existingUser =await this.repository.findByEmail(email);

        if(existingUser){
            throw new AppError("Email already Exist",409);
        }
        return await this.repository.create(name,email);
    }

    async deleteUser(id:string){
        return await this.repository.delete(id);
    }
    
}