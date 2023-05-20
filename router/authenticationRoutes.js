const router = require("express").Router();

const auth = require("../controller/authentication");

// REGISTRATION ROUTES
router.post("/register/customer", auth.register);
router.post("/register/admin", auth.register);

// LOGIN ROUOTES
router.post("/login/admin", auth.login);

module.exports = router;
