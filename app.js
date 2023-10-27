const express = require('express');
const cors = require('cors');

const codedevAPI = require('./projects/codedev/bundle');

const app = express();
const PORT = 3001;

app.use(express.json());
app.use(cors());

app.use('/codedev', codedevAPI);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
