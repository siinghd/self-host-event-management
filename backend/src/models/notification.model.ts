import mongoose from 'mongoose';

const notificationSchema: mongoose.Schema = new mongoose.Schema(
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

// Based on the type of notifications
notificationSchema.index({ type: 1 });

// If you're going to query based on whether the notification has been read
notificationSchema.index({ isRead: 1 });

// Timestamps for sorting
notificationSchema.index({ createdAt: 1 });
notificationSchema.index({ updatedAt: 1 });

export = mongoose.model('Notification', notificationSchema);
