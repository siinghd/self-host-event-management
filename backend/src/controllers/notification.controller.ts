import { Response } from 'express';
import { IGetUserAuthInfoRequest } from '../utils/typesAndInterfaces';
import { WhereClauseNotification } from '../utils/whereClause/WhereClauseNotification';
import bigPromise from '../middlewares/bigPromise';
import NotificationModel from '../models/notification.model';

export const updateNotificationStatus = bigPromise(
  async (req: IGetUserAuthInfoRequest, res: Response) => {
    const { ids } = req.body;
    // update the notification isRead to true, with ids so multiple
    const result = await NotificationModel.updateMany(
      { _id: { $in: ids } },
      { isRead: true }
    );
    if (result.modifiedCount === 0) {
      return res.status(400).json({
        success: false,
        message: 'Notifications not found',
      });
    }
    res.status(200).json({
      success: true,
      message: 'Notifications updated successfully',
    });
  }
);
export const getNotificationBySearch = bigPromise(
  async (req: IGetUserAuthInfoRequest, res: Response) => {
    const firstQ: any = {};

    const docsObj = new WhereClauseNotification(req.query, firstQ, req.user);
    const result = await docsObj.exec();
    res.status(200).json({
      success: true,
      ...result,
    });
  }
);
