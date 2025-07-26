const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const serviceRoutes = require('./routes/serviceRoutes');

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use('/api/services', serviceRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
