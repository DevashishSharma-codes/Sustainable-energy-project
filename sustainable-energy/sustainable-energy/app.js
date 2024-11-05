const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session'); // Import express-session
const Problem = require('./models/problem'); // Import the Problem model
const indexRouter = require('./routes/index');
const app = express();
const PORT =  process.env.PORT || 3000;
const axios = require('axios');
app.use('/', indexRouter);
const methodOverride = require('method-override');

// Set up method-override
app.use(methodOverride('_method'));
// Middleware to parse the request body
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json()); // Added to parse JSON bodies
app.use(express.static(path.join(__dirname, 'public')));



const helmet = require('helmet');

app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        fontSrc: [
          "'self'", 
          "https://fonts.gstatic.com"  // Google Fonts
        ],
        styleSrc: [
          "'self'", 
          "https://fonts.googleapis.com"  // Google Fonts
        ],
        connectSrc: [
          "'self'", 
          "https://newsapi.org"  // Allow connections to News API
        ],
        imgSrc: [
            "'self'", 
            "data:", 
            "*",  // Allow images from all sources
        ],
        scriptSrc: [
          "'self'", 
          "https://unpkg.com"  // Allow scripts from unpkg
        ],
      },
    },
  }));

// Set the view engine to EJS
app.set('view engine', 'ejs');

// Connect to MongoDB (adjust the connection string as needed)
mongoose.connect('mongodb://localhost/sustainable-energy', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// Route to render the home page
app.get('/', (req, res) => {
    res.render('index'); // Ensure you have an 'index.ejs' file in your 'views' directoryyyy
});


// Route to render the share page
app.get('/share', (req, res) => {
    res.render('share'); // Ensure you have a 'share.ejs' file in your 'views' directory
});

// Route to handle form submission from the share page
app.post('/share', async (req, res) => {
    const { title, description } = req.body;

    if (!title || !description) {
        return res.status(400).send('No thought submitted! Please fill out all fields.');
    }

    // Store the problem in the database
    const newProblem = new Problem({ title, description });
    try {
        await newProblem.save();
        console.log('Submitted Problem:', { title, description });
        res.redirect('/solve'); // Redirecting to the solve page after submission
    } catch (err) {
        console.error('Error saving problem:', err);
        res.status(500).send('Error saving problem to the database.');
    }
});

// Route to render the solve page with problems
app.get('/solve', async (req, res) => {
    try {
        const problems = await Problem.find(); // Fetch problems from the database
        res.render('solve', { problems }); // Pass the problems array to the solve.ejs
    } catch (err) {
        console.error('Error fetching problems:', err);
        res.status(500).send('Error fetching problems from the database.');
    }
});



app.delete('/problems/:problemId/solutions/:solutionId', async (req, res) =>{
  const { problemId, solutionId } = req.params;

  try {
      await Problem.findByIdAndUpdate(problemId, { $pull: { solutions: { _id: solutionId } } });
      res.redirect("/solve")
  } catch (error) {
      console.error('Error deleting solution:', error);
      res.status(500).json({ message: 'Error deleting solution', error });
  }
});

app.delete('/problems/:problemId', async (req, res) => {
  const { problemId } = req.params;

  try {
   
      // Find the problem by ID and remove it
      await Problem.findByIdAndDelete(problemId);
      res.redirect("/solve"); // Redirect to the "solve" page after deletion
  } catch (error) {
      console.error('Error deleting problem:', error);
      res.status(500).json({ message: 'Error deleting problem', error });
  }
});
app.get('/blogs', async (req, res) => {
  try {
      const response = await axios.get('https://newsapi.org/v2/everything?q=sustainable-energy&apiKey=fb9f77fedba9455b8e182c69d88a5af3');  
      const articles = response.data.articles; // Get articles from the API response
   
      res.render('blogs', { articles }); // Pass articles to the blogs.ejs view
  } catch (error) {
      console.error('Error fetching news:', error);
      res.status(500).send('Error fetching news from the API.');
  }
});
// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
