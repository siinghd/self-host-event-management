import { NotificationModel, INotification } from '../../models/notification.model';
import { EmailService } from '../email/emailService';
import { createHtmlTemplate, customLogger } from '../methods';
import { UserModel } from '../../models/user.model';

const emailService = new EmailService();

interface CreateNotificationParams {
  content: string;
  type?: string;
  subject?: string;
  targetUsers?: string[]; // Assuming targetUsers are array of User IDs
  targetRoles?: string[]; // Assuming targetRoles are array of Role strings
}

const createNotification = async ({
  content,
  type = 'info',
  subject = 'Updates from Event software',
  targetUsers = [],
  targetRoles = [],
}: CreateNotificationParams) => {
  try {
    const notification: INotification = new NotificationModel({
      content,
      type,
      subject,
      targetUsers,
      targetRoles,
    });

    await notification.save();

    const emailAddresses: string[] = [];

    if (targetUsers.length > 0) {
      const users = await UserModel.find({ _id: { $in: targetUsers } });
      users.forEach((user) => emailAddresses.push(user.email));
    }

    if (targetRoles.length > 0) {
      const users = await UserModel.find({ role: { $in: targetRoles } });
      users.forEach((user) => emailAddresses.push(user.email));
    }

    if (emailAddresses.length > 0) {
      await emailService.sendEmailViaNodeMailer({
        to: emailAddresses,
        subject,
        text: content,
        html: createHtmlTemplate('User', content, subject),
      });
    }
  } catch (error) {
    customLogger('error', 'Error in createNotification:', error);
    throw error; // Or handle it as per your application's error handling policy
  }
};

export { createNotification };
