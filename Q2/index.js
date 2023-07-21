const { rateLimit } = require('./middlewre/ratelimit')
const express = require('express');

const app = express();

app.use(rateLimit('api', 3, 1));

app.get('/api/data', (req, res) => {
  res.send({
    success: true,
    message: 'Data response'
  });
});


app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
