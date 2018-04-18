const mongoose = require("mongoose");
const { Schema } = mongoose;

const searchTermSchema = new Schema(
  {
    searchQuery: String,
    searchDate: Date
  },
  { timestamps: true }
);

module.exports = mongoose.model("searchTerm", searchTermSchema);
