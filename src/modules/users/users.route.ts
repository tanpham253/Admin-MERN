// users.routes.ts
import { Router } from 'express';
import * as usersController from '../../controllers/users.controller';
import { validateSchemaYup } from '../../middleware/validateSchema.middleware';
import userValidation from '../../validations/user.validation';
import { authenticateToken, authRoles } from '../../middleware/auth.middleware';
// console.log('validateSchemaYup:', validateSchemaYup);
const router = Router();

// router.post('/users', usersController.create);

router.get('/users', usersController.findAll);
router.get('/users/:id', usersController.findById);
router.get('/users/:id', usersController.findById);
router.post('/users', usersController.create);
router.put('/users/:id',usersController.updateById);
router.delete('/users/:id', usersController.deleteById);

export default router;
