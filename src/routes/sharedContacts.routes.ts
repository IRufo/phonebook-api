import { Router } from 'express';
import { shareContact, getContactsSharedWithMe, unshareContact, getSharedContact, getSharedContacts } from '../controllers/sharedContact.controller';
import { authenticateUser } from '../middleware/authenticateuser.middleware';
import { authorizeRolesAndOwner } from '../middleware/authorizeRoleorOwner.middleware';

const sharedContactRouter = Router();

sharedContactRouter.get('/', authenticateUser,  getSharedContacts);

sharedContactRouter.get('/shared-with-me', authenticateUser,  getContactsSharedWithMe);

sharedContactRouter.get('/:id', authenticateUser, authorizeRolesAndOwner([], true), getSharedContact);

sharedContactRouter.post('/', authenticateUser, authorizeRolesAndOwner([], true), shareContact);

sharedContactRouter.patch('/unshare/:id', authenticateUser, authorizeRolesAndOwner([], true), unshareContact);

export default sharedContactRouter;
