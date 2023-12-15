import express from 'express';

import { isLoggedIn } from '../middlewares/user';
import {
  sendStripeKey,
  captureStripePayment,
} from '../controllers/payment.controller';

const router = express.Router();

router.route('/stripe/stripekey').get(isLoggedIn, sendStripeKey);
router.route('/stripe/capturestripe').post(isLoggedIn, captureStripePayment);

export = router;
