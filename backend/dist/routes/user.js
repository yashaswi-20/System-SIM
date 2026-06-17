"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const validate_middleware_1 = require("../middleware/validate.middleware");
const user_validator_1 = require("../validators/user.validator");
const router = (0, express_1.Router)();
router.post('/', (0, validate_middleware_1.validate)(user_validator_1.userSchema), (req, res) => {
    res.status(200).json({ success: true });
});
exports.default = router;
