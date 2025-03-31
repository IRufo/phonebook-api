import { Router } from 'express';
import { getUsers, getUserById, updateUser, deleteUser, activateUser, createUser } from '../controllers/user.controller';
import { authenticateUser } from '../middleware/authenticateuser.middleware';
import { authorizeRolesAndOwner } from '../middleware/authorizeRoleorOwner.middleware';

const userRouter = Router();
const roles = ["Super Admin", "Admin"]

userRouter.get('/', authenticateUser, getUsers);

userRouter.get('/:id', authenticateUser, getUserById);

userRouter.patch('/:id', authenticateUser, authorizeRolesAndOwner(roles, true), updateUser);

userRouter.delete('/:id', authenticateUser, authorizeRolesAndOwner(roles, true), deleteUser);

userRouter.patch("/activate/:id", authenticateUser, authorizeRolesAndOwner(roles), activateUser);

userRouter.post("/", authenticateUser, authorizeRolesAndOwner(roles), createUser);


export default userRouter;
