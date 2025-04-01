import { Router } from 'express';
import { shareContact, getSharedContacts, unshareContact, getSharedContact } from '../controllers/sharedContact.controller';
import { authenticateUser } from '../middleware/authenticateuser.middleware';
import { authorizeRolesAndOwner } from '../middleware/authorizeRoleorOwner.middleware';

const sharedContactRouter = Router();

sharedContactRouter.get('/', authenticateUser, authorizeRolesAndOwner([], true), getSharedContacts);

sharedContactRouter.get('/:id', authenticateUser, authorizeRolesAndOwner([], true), getSharedContact);

sharedContactRouter.post('/', authenticateUser, authorizeRolesAndOwner([], true), shareContact);

sharedContactRouter.delete('/:id', authenticateUser, authorizeRolesAndOwner([], true), unshareContact);

export default sharedContactRouter;
