const mongoose = require('mongoose');

const ApiSchema = new mongoose.Schema(
  {
    routeName: { type: String, required: true, trim: true },
    method: {
      type: String,
      required: true,
      uppercase: true,
      enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    },
    responseJson: { type: mongoose.Schema.Types.Mixed, required: true },
    statusCode: { type: Number, default: 200, min: 100, max: 599 },
    delayMs: { type: Number, default: 0, min: 0, max: 10000 },
    hits: { type: Number, default: 0 },
  },
  { timestamps: true, minimize: false }
);

ApiSchema.index({ routeName: 1, method: 1 }, { unique: true });

module.exports = mongoose.model('Api', ApiSchema);
