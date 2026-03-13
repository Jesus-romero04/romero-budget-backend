const express = require("express");
const router  = express.Router();
const { getAll, create, remove, summary, monthlySummary } = require("../controllers/transactionController");
const auth = require("../middlewares/auth");

router.get("/",          auth, getAll);
router.post("/",         auth, create);
router.delete("/:id",    auth, remove);
router.get("/summary",   auth, summary);
router.get("/monthly",   auth, monthlySummary);

module.exports = router;
