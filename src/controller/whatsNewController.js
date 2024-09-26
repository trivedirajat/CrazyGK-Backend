const { uploadAndSaveImage, isValidObjectId } = require("../helper/helper");
const whatsNewModal = require("../models/whatsNewModal");
var { ObjectId } = require("mongodb");

const addWhatsNew = async (req, res) => {
  try {
    const { title } = req.body;

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
        "public/assets/whatsnew"
      );
      if (!uploadResult.success) {
        return res
          .status(500)
          .json({ status: 500, message: uploadResult.message });
      }
      imageUrl = uploadResult.imageUrl;
      req.body.image = imageUrl;
    }

    const result = await whatsNewModal.create(req.body);

    if (result) {
      return res.status(200).json({
        status: 200,
        message: "Add Successfully",
        data: result,
        imageUrl,
        base_url: process.env.BASEURL,
      });
    } else {
      return res.status(500).json({ status: 500, message: "Add Failed." });
    }
  } catch (error) {
    console.log("error", error.message);
    return res.status(500).json({
      status: 500,
      message: "Internal Server Error",
    });
  }
};
const editWhatsNew = async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) {
    return res.status(400).json({
      status: 400,
      message: "Invalid WhatsNew ID.",
    });
  }
  const whatsNew_id = id;
  try {
    const { title } = req.body;

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
        "public/assets/whatsnew"
      );
      if (!uploadResult.success) {
        return res
          .status(500)
          .json({ status: 500, message: uploadResult.message });
      }
      imageUrl = uploadResult.imageUrl;
      req.body.image = imageUrl;
    }

    const result = await whatsNewModal.updateOne(
      { _id: new ObjectId(whatsNew_id) },
      req.body
    );

    if (result) {
      return res.status(200).json({
        status: 200,
        message: "Update Successfully",
      });
    } else {
      return res.status(500).json({ status: 500, message: "Update Failed." });
    }
  } catch (error) {
    console.log("error", error.message);
    return res.status(500).json({
      status: 500,
      message: "Internal Server Error",
    });
  }
};

async function getWhatsNew(req, res) {
  try {
    const { limit = 10, offset = 0, search_title = "" } = req.query;
    const page = Math.max(0, Number(offset));
    const perPage = Math.max(1, Number(limit));

    let query = {};

    if (search_title.trim()) {
      query.title = { $regex: new RegExp(search_title, "i") }; // Case-insensitive search
    }

    const result = await whatsNewModal
      .find(query)
      .sort({ createdDate: "desc" })
      .skip(perPage * page)
      .limit(perPage)
      .exec();

    const total = await whatsNewModal.countDocuments(query);

    if (result.length > 0) {
      return res.status(200).json({
        status: 200,
        message: "Success.",
        data: result,
        total_data: total,
        current_page: page,
        per_page: perPage,
        total_pages: Math.ceil(total / perPage),
      });
    } else {
      return res.status(404).json({
        status: 404,
        message: "No WhatsNew items found.",
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
async function getwhatsnewById(req, res) {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({
      status: 400,
      message: "Invalid WhatsNew ID.",
    });
  }

  try {
    const result = await whatsNewModal.findById(id);

    if (!result) {
      return res.status(404).json({
        status: 404,
        message: "WhatsNew not found",
      });
    }

    return res.status(200).json({
      status: 200,
      message: "Success",
      data: result,
    });
  } catch (error) {
    console.error("Error:", error.message);
    return res.status(500).json({
      status: 500,
      message: "Internal Server Error",
    });
  }
}
async function deleteWhatsNew(req, res) {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({
      status: 400,
      message: "Invalid WhatsNew ID.",
    });
  }
  try {
    const deletewhatsNew = await whatsNewModal.findByIdAndDelete(id);

    if (!deletewhatsNew) {
      return res.status(404).json({
        status: 404,
        message: "whatsNew not found",
      });
    }

    return res.status(200).json({
      status: 200,
      message: "whatsNew deleted successfully",
    });
  } catch (error) {
    console.error("Error:", error.message);
    return res.status(500).json({
      status: 500,
      message: "Internal Server Error",
    });
  }
}

module.exports = {
  addWhatsNew,
  getWhatsNew,
  deleteWhatsNew,
  editWhatsNew,
  getwhatsnewById,
};
