import { Router } from 'express';
import { check } from 'express-validator';
import * as userController from '../controllers/user.controller';
import * as fieldsValidationMiddleware from '../middlewares/fieldsValidation';
import { isLoggedIn, customRole } from '../middlewares/user';
import * as zodValidate from '../middlewares/zodValidate';
import * as userSchemas from '../zodSchemas';
import { UserRole } from '../models/user.model';

const router: Router = Router();

// User Authentication Routes
router.post(
  '/users/signup',
  zodValidate.validate(userSchemas.signupSchema),
  userController.signup
);
router.post(
  '/users/login',
  zodValidate.validate(userSchemas.loginSchema),
  userController.login
);
router.post(
  '/users/logout',
  isLoggedIn,
  zodValidate.validate(userSchemas.logoutSchema),
  userController.logout
);
router.get(
  '/users/logout-all-devices',
  isLoggedIn,
  userController.logoutAllDevices
);
router.post(
  '/users/refresh-token',
  isLoggedIn,
  refreshTokenValidation(),
  fieldsValidationMiddleware.checkFields,
  userController.generateRefreshToken
);

// User Invitation Routes
router.get(
  '/users/invitations/validate/:token',
  userController.checkInvitationToken
);
router.post(
  '/users/invitations/register',
  invitationRegisterValidation(),
  fieldsValidationMiddleware.checkFields,
  userController.registerInvitedUser
);

// Password Reset (JWT)
router.post(
  '/users/password-reset/request-jwt',
  userController.forgotPasswordJwt
);
router.post(
  '/users/password-reset/confirm-jwt/:token',
  userController.passwordResetJwtToken
);

// Password Reset (Database) - Commented
// router.post('/users/password-reset/request', userController.forgotPassword);
// router.post('/users/password-reset/confirm/:token', userController.passwordReset);

// User Profile Routes
router
  .route('/users/profile')
  .get(isLoggedIn, userController.getLoggedInUserDetails)
  .put(isLoggedIn, userController.updateUserDetails);

// Change Password (Commented)
// router.post('/users/password-change', isLoggedIn, userController.changePassword);

// Admin Password Reset Request
router.post(
  '/admin/users/password-reset/request',
  [check('email').notEmpty().withMessage('Email must be provided')],
  fieldsValidationMiddleware.checkFields,
  userController.adminAskForPasswordReset
);

// Admin User Management Routes
router.get(
  '/admin/users',
  isLoggedIn,
  customRole(UserRole.Admin),
  userController.adminAllUser
);
router.post(
  '/admin/users/invitations',
  isLoggedIn,
  zodValidate.validate(userSchemas.inviteUserSchema),
  customRole(UserRole.Admin),
  userController.inviteUser
);
router
  .route('/admin/users/:userId')
  .get(isLoggedIn, customRole(UserRole.Admin), userController.adminGetOneUser)
  .put(
    isLoggedIn,
    customRole(UserRole.Admin),
    userController.adminUpdateUserDetails
  )
  .delete(
    isLoggedIn,
    customRole(UserRole.Admin),
    userController.adminDeleteOneUser
  );

export default router;

// Helper functions for validation
function refreshTokenValidation() {
  return [
    check('refreshToken')
      .not()
      .isEmpty()
      .withMessage('Refresh token is required'),
  ];
}

function invitationRegisterValidation() {
  return [
    check('email').not().isEmpty().withMessage('Email must be provided'),
    check('password').not().isEmpty().withMessage('Password must be provided'),
    check('confirmPassword')
      .not()
      .isEmpty()
      .withMessage('Confirm Password must be provided'),
    check('token').not().isEmpty().withMessage('Token must be provided'),
  ];
}
