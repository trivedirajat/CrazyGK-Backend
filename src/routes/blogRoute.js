var express = require('express');
var router = express.Router();

const multer = require("multer");


var {addBlog, getBlogs, deleteBlog} = require('../controller/blogController');


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "public/assets/blog/");
    },
  
    filename: function (req, file, cb) {
        const ext = file.originalname.split('.').pop();
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, "blog-" + uniqueSuffix + '.' + ext);
    },
  });
  const upload = multer({ storage: storage });

router.post('/addBlog', upload.fields([{ name: "image" }]), addBlog);
router.post('/getBlogs', getBlogs);
router.post('/deleteBlog', deleteBlog);

module.exports = router;
