const cool = require('cool-ascii-faces');
const express = require('express');
const router = express.Router();

router.get('/cool',(req, res) => res.send(cool()))

module.exports = router;
