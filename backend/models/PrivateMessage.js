const mongoose = require("mongoose");

const privateMessageSchema = new mongoose.Schema({
  from_user: { type: String, required: true, trim: true },
  to_user: { type: String, required: true, trim: true },
  message: { type: String, required: true, trim: true, maxlength: 1000 },
  date_sent: { type: Date, default: Date.now },
});

module.exports = mongoose.model("PrivateMessage", privateMessageSchema);