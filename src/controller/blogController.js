const blogModal = require("../models/blogModal");
var { ObjectId } = require("mongodb");
const { uploadAndSaveImage, isValidObjectId } = require("../helper/helper");
const { default: mongoose } = require("mongoose");

const addBlog = async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title || title.trim() === "") {
      return res
        .status(400)
        .json({ status: 400, message: "Title cannot be empty." });
    }

    let imageUrl = null;
    if (req.files && req.files.image) {
      const uploadResult = await uploadAndSaveImage(
        req,
        "image",
        "public/assets/blogs"
      );
      if (!uploadResult.success) {
        return res
          .status(500)
          .json({ status: 500, message: uploadResult.message });
      }
      imageUrl = uploadResult.imageUrl;
    }

    // Check for existing blog
    const existingBlog = await blogModal.findOne({ title });
    if (existingBlog) {
      return res
        .status(400)
        .json({ status: 400, message: "This blog already exists." });
    }

    // Create new blog
    const result = await blogModal.create({
      title,
      description,
      image: imageUrl,
    });

    return res.status(201).json({
      status: 201,
      message: "Blog added successfully",
      data: result,
      imageUrl,
    });
  } catch (error) {
    console.error("Error:", error.message);
    return res
      .status(500)
      .json({ status: 500, message: "Internal Server Error" });
  }
};
const editBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const blog_id = id;
    const { title, description } = req.body;

    if (!title || title.trim() === "") {
      return res
        .status(400)
        .json({ status: 400, message: "Title cannot be empty." });
    }

    let imageUrl = null;
    if (req.files && req.files.image) {
      const uploadResult = await uploadAndSaveImage(
        req,
        "image",
        "public/assets/blogs"
      );
      if (!uploadResult.success) {
        return res
          .status(500)
          .json({ status: 500, message: uploadResult.message });
      }
      imageUrl = uploadResult.imageUrl;
    }

    // Update existing blog
    const result = await blogModal.updateOne(
      { _id: new mongoose.Types.ObjectId(blog_id) },
      { title, description, image: imageUrl || undefined },
      { new: true }
    );

    if (!result.acknowledged) {
      return res.status(404).json({ status: 404, message: "Blog not found." });
    }

    return res.status(200).json({
      status: 200,
      message: "Blog updated successfully",
    });
  } catch (error) {
    console.error("Error:", error.message);
    return res
      .status(500)
      .json({ status: 500, message: "Internal Server Error" });
  }
};

async function getBlogs(req, res) {
  try {
    const { limit = 10, offset = 0, title = "", subject_id } = req.query;
    const page = Math.max(0, Number(offset));
    const perPage = Math.max(1, Number(limit));

    let query = {};
    if (title.trim()) {
      query.title = { $regex: new RegExp(title, "i") };
    }
    if (subject_id && mongoose.isValidObjectId(subject_id)) {
      query.subject_id = subject_id;
    }

    const result = await blogModal
      .find(query)
      .skip(perPage * page)
      .limit(perPage)
      .sort({ createdDate: "desc" })
      .exec();

    const total = await blogModal.countDocuments(query);

    if (result.length > 0) {
      return res.status(200).json({
        status: 200,
        message: "Success",
        data: result,
        total_data: total,
        current_page: page,
        per_page: perPage,
        total_pages: Math.ceil(total / perPage),
      });
    } else {
      return res.status(404).json({
        status: 404,
        message: "No blogs found.",
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
async function deleteBlog(req, res) {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({ status: 400, message: "Invalid blog ID." });
  }

  try {
    const deletedBlog = await blogModal.findByIdAndDelete(id);

    if (!deletedBlog) {
      return res.status(404).json({ status: 404, message: "Blog not found." });
    }

    return res.status(200).json({
      status: 200,
      message: "Blog deleted successfully.",
    });
  } catch (error) {
    console.error("Error:", error.message);
    return res
      .status(500)
      .json({ status: 500, message: "Internal Server Error" });
  }
}
async function getBlogById(req, res) {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ status: 400, message: "Invalid blog ID." });
    }

    const blog = await blogModal.findById(id);

    if (!blog) {
      return res.status(404).json({ status: 404, message: "Blog not found." });
    }

    return res.status(200).json({
      status: 200,
      message: "Success",
      data: blog,
    });
  } catch (error) {
    console.error("Error:", error.message);
    return res
      .status(500)
      .json({ status: 500, message: "Internal Server Error" });
  }
}
module.exports = { addBlog, editBlog, getBlogs, deleteBlog, getBlogById };
