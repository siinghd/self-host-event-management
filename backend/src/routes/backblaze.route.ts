import { Router } from 'express';

import { isLoggedIn } from '../middlewares/user';
import { getUploadUrl } from '../controllers/backblaze.controller';

const router: Router = Router();

router.route('/storage/getuploadurl').get(isLoggedIn, getUploadUrl);
export = router;
