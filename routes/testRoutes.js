const express=require('express');
const { testControllers } = require('../controllers/testControllers');

//routes object
const router=express.Router();
// router obj
router.get('/',testControllers)

// export
module.exports=router;