var subjects = require("../models/subjects");
const bookModal = require("../models/bookModal");
var { ObjectId } = require("mongodb");
const { uploadAndSaveImage, isValidObjectId } = require("../helper/helper");

async function addBook(req, res) {
  try {
    const { pdf_link } = req.body;

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

    const result = await bookModal.create(req.body);

    if (result) {
      return res.status(200).json({
        status: 200,
        message: "Book added successfully",
        data: result,
        imageUrl,
        base_url: process.env.BASEURL,
      });
    } else {
      return res.status(500).json({ status: 500, message: "Add failed." });
    }
  } catch (error) {
    console.log("error", error.message);
    return res.status(500).json({
      status: 500,
      message: "Internal Server Error",
    });
  }
}
async function editBook(req, res) {
  const { id } = req.params;

  if (!id || !isValidObjectId(id)) {
    return res
      .status(400)
      .json({ status: 400, message: "Invalid or missing book ID." });
  }
  try {
    const book_id = id;
    const { pdf_link } = req.body;

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

    // Update the book details in the database
    const result = await bookModal.updateOne(
      { _id: new ObjectId(book_id) },
      req.body
    );

    if (result.modifiedCount > 0) {
      return res.status(200).json({
        status: 200,
        message: "Book updated successfully",
        data: result,
        imageUrl,
        base_url: process.env.BASEURL,
      });
    } else {
      return res.status(500).json({ status: 500, message: "Update failed." });
    }
  } catch (error) {
    console.log("error", error.message);
    return res.status(500).json({
      status: 500,
      message: "Internal Server Error",
    });
  }
}
async function getBookById(req, res) {
  try {
    const { id } = req.params;

    // Ensure a valid ID is provided
    if (!id || !isValidObjectId(id)) {
      return res
        .status(400)
        .json({ status: 400, message: "Invalid or missing book ID." });
    }

    // Find the book by its ID
    const result = await bookModal.findById(id);

    if (result) {
      return res.status(200).json({
        status: 200,
        message: "Success",
        data: result,
        base_url: process.env.BASEURL,
      });
    } else {
      return res.status(404).json({
        status: 404,
        message: "Book not found.",
      });
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
    const { limit = 10, offset = 0, is_active } = req.query;
    const page = Math.max(0, Number(offset));
    const perPage = Math.max(1, Number(limit));

    let query = {};
    if (is_active !== undefined && is_active !== "") {
      query.is_active = is_active;
    }

    const result = await bookModal
      .find(query)
      .skip(perPage * page)
      .limit(perPage)
      .sort({ createdDate: "desc" })
      .exec();

    const total = await bookModal.countDocuments(query);

    if (result.length > 0) {
      return res.status(200).json({
        status: 200,
        message: "Success",
        data: result,
        total_data: total,
        current_page: page,
        per_page: perPage,
        total_pages: Math.ceil(total / perPage),
        base_url: process.env.BASEURL,
      });
    } else {
      return res.status(404).json({
        status: 404,
        message: "No books found.",
      });
    }
  } catch (error) {
    console.error("Error:", error.message);
    return res.status(500).json({
      status: 500,
      message: "Internal Server Error",
    });
  }
}

async function deleteBook(req, res) {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({
      status: 400,
      message: "Invalid book ID.",
    });
  }

  try {
    const deletedBook = await bookModal.findByIdAndDelete(id);

    if (!deletedBook) {
      return res.status(404).json({
        status: 404,
        message: "Book not found.",
      });
    }

    return res.status(200).json({
      status: 200,
      message: "Book deleted successfully.",
    });
  } catch (error) {
    console.error("Error:", error.message);
    return res.status(500).json({
      status: 500,
      message: "Internal Server Error",
    });
  }
}

module.exports = { addBook, getBooks, deleteBook, getBookById, editBook };
