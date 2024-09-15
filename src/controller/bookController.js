var subjects = require("../models/subjects");
const bookModal = require("../models/bookModal");
var { ObjectId } = require("mongodb");
const { uploadAndSaveImage } = require("../helper/helper");

async function addBook(req, res) {
  try {
    const { book_id, pdf_link } = req.body;

    if (!pdf_link || pdf_link.trim() === "") {
      return res
        .status(400)
        .json({ status: 400, message: "PDF link cannot be empty." });
    }

    let imageUrl = null;

    if (req.files && req.files.image) {
      const uploadResult = await uploadAndSaveImage(
        req,
        "image",
        "public/assets/books"
      );
      if (!uploadResult.success) {
        return res
          .status(500)
          .json({ status: 500, message: uploadResult.message });
      }
      imageUrl = uploadResult.imageUrl;
      req.body.image = imageUrl;
    }

    let msg;
    let result;

    if (book_id) {
      result = await bookModal.updateOne(
        { _id: new ObjectId(book_id) },
        req.body
      );
      msg = "Update";
    } else {
      result = await bookModal.create(req.body);
      msg = "Add";
    }

    // Check if operation succeeded
    if (result) {
      return res.status(200).json({
        status: 200,
        message: `${msg} Successfully`,
        data: result,
        imageUrl,
        base_url: process.env.BASEURL,
      });
    } else {
      return res.status(500).json({ status: 500, message: `${msg} Failed.` });
    }
  } catch (error) {
    console.log("error", error.message);
    return res.status(500).json({
      status: 500,
      message: "Internal Server Error",
    });
  }
}

async function getBooks(req, res) {
  try {
    // const user_id = req.user_id
    // if(user_id === undefined || user_id === ''){
    //     var responce = {
    //         status: 403,
    //         message: 'User not authorised.',
    //     }
    //     return res.status(403).send(responce);
    // }
    const { limit = 400, offset = 0, is_active } = req.body;
    const page = Math.max(0, Number(offset));

    let query = {};
    if (is_active != undefined && is_active != "") {
      query.is_active = is_active;
    }

    const result = await bookModal
      .find(query)
      .skip(Number(limit) * page)
      .limit(Number(limit))
      .exec();
    if (result.length > 0) {
      const total = await bookModal.count();

      var response = {
        status: 200,
        message: "Success.",
        data: result,
        total_data: total,
        base_url: process.env.BASEURL,
      };
      return res.status(200).send(response);
    } else {
      var response = {
        status: 201,
        message: "Failed.",
      };
      return res.status(201).send(response);
    }
  } catch (error) {
    console.log("error", error.message);
    var responce = {
      status: 501,
      message: "Internal Server Error",
    };
    return res.status(501).send(responce);
  }
}
async function deleteBook(req, res) {
  try {
    // const user_id = req.user_id
    // if(user_id === undefined || user_id === ''){
    //     var responce = {
    //         status: 403,
    //         message: 'User not authorised.',
    //     }
    //     return res.status(403).send(responce);
    // }
    const { book_id } = req.body;

    const result = await bookModal.deleteOne({ _id: new ObjectId(book_id) });
    var response = {
      status: 200,
      message: "Success.",
    };
    return res.status(200).send(response);
  } catch (error) {
    console.log("error", error.message);
    var responce = {
      status: 501,
      message: "Internal Server Error",
    };
    return res.status(501).send(responce);
  }
}

module.exports = { addBook, getBooks, deleteBook };
