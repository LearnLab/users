const express = require('express');
const app = express();

const port = process.env.PORT || '3000';

var apiRouter = require('./routes/api');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/v1', apiRouter);

// Catch 404 and return error response
app.use(function(req, res, next) {
  res.status(404).json({
    "errors": [
      {
        "status": "404",
        "source": { "pointer": req.path },
        "title": "Resource not found",
        "detail": "Sorry, we couldn't find the resource you were looking for, maybe you misspoke?"
      }
    ]
  });
});

// Error handler
app.use(function(err, req, res, next) {
  console.log("The error was", err);

  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      "errors": [
        {
          "status": "401",
          "source": { "pointer": req.path },
          "title": err.name,
          "detail": "You're not allowed to access this resource."
        }
      ]
    });
  }

  if (err.name === 'URIError') {
    return res.type('application/vnd.api+json').status(400).json({
      "errors": [
        {
          "status": "400",
          "source": { "pointer": "/data/attributes" },
          "title": err.name,
          "detail": "Failed to decode the URI param"
        }
      ]
    });
  }
});

// Check if the app should listen or be exported as a module
if (require.main === module) {
  app.listen(port, () => {
    console.log(`Express started in port ${port}.`);
    console.log('Press Ctrl + c to terminate.');
  });
} else {
  module.exports = app;
}
