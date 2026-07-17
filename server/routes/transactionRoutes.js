const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  list,
  create,
  update,
  remove,
  summary,
} = require('../controllers/transactionController');

router.use(auth);

router.get('/summary', summary);
router.get('/', list);
router.post('/', create);
router.put('/:id', update);
router.delete('/:id', remove);

module.exports = router;
