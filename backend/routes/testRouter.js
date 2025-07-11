const express = require('express');
const router = express.Router();

router.get('/', (req, res) => res.send('Test Router Working!'));
module.exports = router;