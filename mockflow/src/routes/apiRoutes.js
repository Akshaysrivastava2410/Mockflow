const router = require('express').Router();
const { createApi, listApis, deleteApi } = require('../controllers/apiController');

router.post('/create-api', createApi);
router.get('/list-apis', listApis);
router.delete('/delete-api/:id', deleteApi);

module.exports = router;
