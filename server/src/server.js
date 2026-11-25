require('dotenv').config();

const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`ABES admission API running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Server could not start:', error.message);
    process.exit(1);
  });
