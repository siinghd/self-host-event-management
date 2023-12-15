import { Router } from 'express';

import { isLoggedIn, customRole } from '../middlewares/user';
import {
  getNotificationBySearch,
  updateNotificationStatus,
} from '../controllers/notification.controller';

const router: Router = Router();

router.route('/notification/read').put(
  isLoggedIn,

  customRole('factory', 'admin', 'salesman', 'manager', 'validator'),
  updateNotificationStatus
);

router.route('/notification/search').get(
  isLoggedIn,

  customRole('factory', 'admin', 'salesman', 'manager', 'validator'),
  getNotificationBySearch
);
export = router;
