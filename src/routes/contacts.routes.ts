import { Router } from 'express';
import { addContact, updateContact, deleteContact, getContacts, getContactById } from '../controllers/contact.controller';
import { authenticateUser } from '../middleware/authenticateuser.middleware';
import upload from '../middleware/upload.middleware';
import { authorizeRolesAndOwner } from '../middleware/authorizeRoleorOwner.middleware';

const contactRouter = Router();
const roles = ['Admin', 'Super Admin'] 

contactRouter.get('/', authenticateUser, getContacts);

contactRouter.get('/:id', authenticateUser, getContactById);

contactRouter.post('/', authenticateUser, upload, addContact);

contactRouter.patch('/delete/:id', authenticateUser, authorizeRolesAndOwner([], true), deleteContact);

contactRouter.patch('/:id', authenticateUser,  upload, authorizeRolesAndOwner([], true), updateContact);


export default contactRouter;
