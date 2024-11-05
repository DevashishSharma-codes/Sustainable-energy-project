const mongoose = require('mongoose');


const problemSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    upvotes: { type: Number, default: 0 },
    downvotes: { type: Number, default: 0 },
    solutions: [
      {
          text: String,  // Store the solution text
          // You can add other fields here if needed, like:
          // author: String,
          // date: { type: Date, default: Date.now }
      }
  ],
    upvoted: { type: Boolean, default: false },
    downvoted: { type: Boolean, default: false },
});

const Problem = mongoose.model('Problem', problemSchema);

module.exports = Problem;
