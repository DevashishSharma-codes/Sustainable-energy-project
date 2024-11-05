const express = require('express');
const router = express.Router();
const Problem = require('../models/problem');
router.use(express.urlencoded({ extended: true }));
router.use(express.json());
const helmet = require('helmet');
router.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],                  // Default to self (your own domain)
      fontSrc: ["'self'", "https://fonts.gstatic.com"],  // Allow fonts from Google
      styleSrc: ["'self'", "https://fonts.googleapis.com"], // Allow CSS from Google
      connectSrc: ["'self'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:"],
    },
  },
}));
// Route to fetch problems for solving
router.get('/solve', async (req, res) => {
    try {
        const problems = await Problem.find().sort({ upvotes: -1 });
        res.render('solve', { problems });
    } catch (err) {
        console.error('Error fetching problems:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Route for upvoting a problem
router.post('/problems/:id/upvote', async (req, res) => {
    try {
        const problem = await Problem.findById(req.params.id);
        if (!problem) return res.status(404).json({ error: 'Problem not found' });

        // Upvote logic (check session userId, ensure unique votes, etc.)
        problem.upvotes += 1;
        await problem.save();
        res.json({ message: 'Upvoted successfully' });
    } catch (err) {
        console.error('Error upvoting:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Route for downvoting a problem
router.post('/problems/:id/downvote', async (req, res) => {
    try {
        const problem = await Problem.findById(req.params.id);
        if (!problem) return res.status(404).json({ error: 'Problem not found' });

        // Downvote logic
        problem.downvotes += 1;
        await problem.save();
        res.json({ message: 'Downvoted successfully' });
    } catch (err) {
        console.error('Error downvoting:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Route to add a solution to a problem
router.post('/problems/:id/solutions', async (req, res) => {
  try {
      const problemId = req.params.id;  // Get the problem ID from the URL
      const solutionText = req.body.solution;  // Get the solution text from the form data

      // Find the problem by ID
      const problem = await Problem.findById(problemId);
      
      if (!problem) {
          return res.status(404).send({ error: 'Problem not found' });
      }

      // Add the solution to the problem
      problem.solutions.push({ text: solutionText });

      // Save the updated problem
      await problem.save();

      // Redirect back to /solve
      res.redirect('/solve');
  } catch (error) {
      console.error('Error adding solution:', error);
      res.status(500).send({ error: 'Server error' });
  }
});

module.exports = router;