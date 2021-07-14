const express = require('express');
const { RequireHeader } = require('./middleware/RequireHeader');
const {
  FAIL_DECODING_URI_PARAM,
  UNAUTHORIZED_ACCESS,
  RESOURCE_NOT_FOUND,
} = require('./errors');

const app = express();

const port = process.env.PORT || 3000;

const apiRouter = require('./routes/api');

app.use(
  express.json({ type: 'application/vnd.api+json' }),
  express.urlencoded({ extended: true }),
);

app.use(RequireHeader);

app.use('/api/v1', apiRouter);

// Catch 404 and return error response
app.use((_, res) => res.status(404).json({ errors: [RESOURCE_NOT_FOUND] }));

// Error handler
app.use((err, req, res) => {
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ errors: [UNAUTHORIZED_ACCESS] });
  }

  if (err.name === 'URIError') {
    return res.status(400).json({ errors: [FAIL_DECODING_URI_PARAM] });
  }
});

// Check if the app should listen or be exported as a module
if (require.main === module) {
  app.listen(port, () => {
    console.log(`Express started in port ${port}.`);
  });
} else {
  module.exports = app;
}
