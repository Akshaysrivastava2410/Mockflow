const router = require('express').Router();
const { handleMock } = require('../controllers/mockController');

router.all('/*', handleMock);

module.exports = router;
