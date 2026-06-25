import {Request,Response} from 'express'
import {UserService} from '../services/user.service'
import {AppError} from '../utils/AppError'
import {asyncHandler} from "../utils/AsyncHandler"

export class UserController{
    private service = new UserService();


    getUser = asyncHandler(async(req:Request , res :Response)=>{
        const user= await this.service.getUsers();
        res.status(200).json({
            success:true,
            data:user
        })
    }) 

    getUserById = asyncHandler(async(req:Request<{id:string}> , res :Response)=>{
        const id= req.params.id;
        const user= await this.service.getUserById(id);

        if(!user){
            throw new AppError("User Not Found",404);
        }

        res.status(200).json({
            success:true,
            data:user
        })
    })

    createUser = asyncHandler(async(req:Request ,res :Response)=>{
        const {name,email} = req.body;

        const user= await this.service.createUser(name,email);

        res.status(201).json({
            success:true,
            data:user
        })
    })

    deleteUser = asyncHandler(async (req:Request<{id:string}>, res:Response)=>{
        const id=req.params.id;

        await this.service.deleteUser(id)

        res.status(200).json({
            success:true,
        })


    })


}