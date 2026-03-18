const app = require('../src/app');
const connectDB = require('../src/config/db');

let initialized = false;

module.exports = async (req, res) => {
  if (!initialized) {
    await connectDB();
    initialized = true;
  }

  return app(req, res);
};
