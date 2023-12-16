import mongoose, { Document, Model } from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: [
        'info',
        'warning',
        'alert',
        'other',
        'password-reset',
        'user-password-reset-success',
      ],
      default: 'info',
    },
    subject: {
      type: String,
      default: '',
    },
    targetUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    targetRoles: [
      {
        type: String,
        enum: ['user', 'admin', 'validator', 'factory', 'manager', 'salesman'],
      },
    ],
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Add indexes as needed
notificationSchema.index({ type: 1 });
notificationSchema.index({ isRead: 1 });
notificationSchema.index({ createdAt: 1 });
notificationSchema.index({ updatedAt: 1 });

// Interface representing a document in MongoDB.
export interface INotification extends Document {
  content: string;
  type:
    | 'info'
    | 'warning'
    | 'alert'
    | 'other'
    | 'password-reset'
    | 'user-password-reset-success';
  subject: string;
  targetUsers: mongoose.Types.ObjectId[];
  targetRoles: (
    | 'user'
    | 'admin'
    | 'validator'
    | 'factory'
    | 'manager'
    | 'salesman'
  )[];
  isRead: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// Interface representing the model
export interface INotificationModel extends Model<INotification> {
  // Define any static methods here
}

export const NotificationModel = mongoose.model<
  INotification,
  INotificationModel
>('Notification', notificationSchema);
