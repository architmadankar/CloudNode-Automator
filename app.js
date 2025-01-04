const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => res.send('Hello World!<br>This app was created by Archit Madankar for the DevOps Intern Task for Swayatt Drishtigochar.'));

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
