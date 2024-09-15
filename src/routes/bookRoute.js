var express = require('express');
var router = express.Router();

const multer = require("multer");


var {addBook, getBooks, deleteBook} = require('../controller/bookController');


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "public/assets/books/");
    },
  
    filename: function (req, file, cb) {
        const ext = file.originalname.split('.').pop();
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, "book-" + uniqueSuffix + '.' + ext);
    },
  });
  
  const upload = multer({ storage: storage });

router.post('/addBook', upload.fields([{ name: "image" }]), addBook);
router.post('/getBooks', getBooks);
router.post('/deleteBook', deleteBook);

module.exports = router;
