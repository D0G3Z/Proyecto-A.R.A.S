const express = require('express');
const router = express.Router();
const { login } = require('../controllers/loginController');

router.post('/login-test', (req, res) => {
  res.json({ success: true, message: "Ruta login funciona" });
});


router.post('/login', login);

module.exports = router;
