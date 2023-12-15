/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
// replace with your actual path

import UserModel from '../../models/user.model';
import NotificationModel from '../../models/notification.model';
import { EmailService } from '../email/emailService';
import { createHtmlTemplate } from '../methods';

const emailService = new EmailService();

const createNotification = async ({
  content,
  type = 'info',
  subject = 'Updates from HONPE PORTAL',
  targetUsers = [],
  targetRoles = [],
}: {
  content?: any;
  type?: string;
  subject?: string;
  targetUsers?: any;
  targetRoles?: any;
}) => {
  const notification = new NotificationModel({
    content,
    type,
    subject,
    targetUsers,
    targetRoles,
  });

  await notification.save();

  const emailAddresses: string[] = [];
  // If targeting a specific user
  // Utility function to send emails

  if (targetUsers && targetUsers.length > 0) {
    const users = await UserModel.find({ _id: { $in: targetUsers } });
    for (const user of users) {
      emailAddresses.push(user.email);
    }
  }

  // If targeting a role
  if (targetRoles && targetRoles.length > 0) {
    const users = await UserModel.find({ role: { $in: targetRoles } });
    for (const user of users) {
      emailAddresses.push(user.email);
    }
  }

  // Send the email to all addresses
  if (emailAddresses.length > 0) {
    await emailService.sendEmailViaNodeMailer({
      to: emailAddresses, // Pass the array here
      subject,
      text: content,
      html: createHtmlTemplate('User', content, subject), // Modify this as needed
    });
  }
};

export { createNotification };
