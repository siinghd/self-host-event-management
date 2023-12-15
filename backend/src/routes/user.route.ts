import { Router } from 'express';
import { check } from 'express-validator';

import {
  signup,
  login,
  logout,
  /*   forgotPassword,
  passwordReset, */
  getLoggedInUserDetails,
  /*   changePassword, */
  adminAllUser,
  adminDeleteOneUser,
  adminGetOneUser,
  /*   forgotPasswordJwt,
  passwordResetJwtToken, */
  logoutAllDevices,
  generateRefreshToken,
  inviteUser,
  checkInvitationToken,
  registerInvitedUser,
  updateUserDetails,
  adminUpdateUserDetails,
  adminAskForPasswordReset,
} from '../controllers/user.controller';
import { checkFields } from '../middlewares/fieldsValidation';
import { isLoggedIn, customRole } from '../middlewares/user';

const router: Router = Router();

router
  .route('/user/signup')
  .post(
    [
      check('name').not().isEmpty().withMessage('Name must be provided'),
      check('email')
        .not()
        .isEmpty()
        .withMessage('Name must be provided')
        .isEmail()
        .withMessage('Email must be in valid format'),
      check('password')
        .not()
        .isEmpty()
        .withMessage('Password must be provided')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long'),
    ],
    checkFields,
    signup
  );
router.route('/user/login').post(login);
router
  .route('/user/logout')
  .post(
    isLoggedIn,
    [
      check('refreshToken')
        .not()
        .isEmpty()
        .withMessage('Refresh token is required'),
    ],
    checkFields,
    logout
  );
router.route('/user/logoutalldevices').get(isLoggedIn, logoutAllDevices);
router
  .route('/user/refreshtoken')
  .post(
    isLoggedIn,
    [
      check('refreshToken')
        .not()
        .isEmpty()
        .withMessage('Refresh token is required'),
    ],
    checkFields,
    generateRefreshToken
  );
router.route('/user/invite/validate/:token').get(checkInvitationToken);
router
  .route('/user/invite/register')
  .post(
    [
      check('email').not().isEmpty().withMessage('Email must be provided'),
      check('password')
        .not()
        .isEmpty()
        .withMessage('Password must be provided'),
      check('confirmPassword')
        .not()
        .isEmpty()
        .withMessage('Confirm Password must be provided'),
      check('token').not().isEmpty().withMessage('Token must be provided'),
    ],
    checkFields,
    registerInvitedUser
  );

/* // jwt reset pass
router.route('/user/forgotpasswordjwt').post(forgotPasswordJwt);
router.route('/user/password/resetjwt/:token').post(passwordResetJwtToken);
// db reset pass
router.route('/user/forgotpassword').post(forgotPassword);
router.route('/user/password/reset/:token').post(passwordReset); */

router
  .route('/user/me')
  .get(isLoggedIn, getLoggedInUserDetails)
  .put(isLoggedIn, updateUserDetails);
// router.route('/user/password/update').post(isLoggedIn, changePassword);
router
  .route('/user/forgot-password')
  .post(
    [check('email').notEmpty().withMessage('Email must be provided')],
    checkFields,
    adminAskForPasswordReset
  );

// router.route('/user/userdashboard/update').post(isLoggedIn, updateUserDetails);

// admin only routes
router
  .route('/user/admin/user/search')
  .get(isLoggedIn, customRole('admin', 'salesman', 'manager'), adminAllUser);
router
  .route('/user/admin/invite')
  .post(
    isLoggedIn,
    [
      check('name').not().isEmpty().withMessage('Name must be provided'),
      check('email').not().isEmpty().withMessage('Email must be provided'),
      check('phoneNumber')
        .not()
        .isEmpty()
        .withMessage('Phone number must be provided'),
      check('surname').not().isEmpty().withMessage('Surname must be provided'),
      check('role').not().isEmpty().withMessage('Role must be provided'),
    ],
    checkFields,
    customRole('admin'),
    inviteUser
  );
router
  .route('/user/admin/user/:id')
  .get(isLoggedIn, customRole('admin', 'manager'), adminGetOneUser)
  .put(isLoggedIn, customRole('admin', 'manager'), adminUpdateUserDetails)
  .delete(isLoggedIn, customRole('admin'), adminDeleteOneUser);

export = router;
