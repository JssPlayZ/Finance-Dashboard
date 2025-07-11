const mongoose = require('mongoose');

const ledgerEntrySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ["Credit", "Debit"],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    default: "General"
  }
}, { timestamps: true });

module.exports = mongoose.model("LedgerEntry", ledgerEntrySchema);