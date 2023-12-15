import mongoose from 'mongoose';

const logSchema: mongoose.Schema = new mongoose.Schema(
  {
    level: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
    },
    hostname: {
      type: String,
      required: true,
    },
    meta: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  { timestamps: true, collection: 'log' }
);
// Based on the log level
logSchema.index({ level: 1 });

// Timestamps for sorting and filtering by time
logSchema.index({ createdAt: 1 });
logSchema.index({ updatedAt: 1 });

// If you need to query by hostname
logSchema.index({ hostname: 1 });
module.exports = mongoose.model('Log', logSchema);
