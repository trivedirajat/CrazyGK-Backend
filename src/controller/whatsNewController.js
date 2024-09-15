const { uploadAndSaveImage } = require("../helper/helper");
const whatsNewModal = require("../models/whatsNewModal");
var { ObjectId } = require("mongodb");

async function addWhatsNew(req, res) {
  try {
    const { whatsNew_id, title } = req.body;

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

    let msg;
    let result;

    // Update existing "What's New" entry
    if (whatsNew_id) {
      result = await whatsNewModal.updateOne(
        { _id: new ObjectId(whatsNew_id) },
        req.body
      );
      msg = "Update";
    } else {
      // Create new "What's New" entry
      result = await whatsNewModal.create(req.body);
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

async function getWhatsNew(req, res) {
  try {
    const { limit = 400, offset = 0, search_title } = req.body;
    const page = Math.max(0, Number(offset));

    let query = {};
    if (search_title != undefined && search_title != "") {
      query.title = { $regex: new RegExp(search_title, "ig") };
    }
    const result = await whatsNewModal
      .find(query)
      .sort({ _id: -1 })
      .skip(Number(limit) * page)
      .limit(Number(limit))
      .exec();
    if (result.length > 0) {
      const total = await whatsNewModal.count(query);

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
async function deleteWhatsNew(req, res) {
  try {
    // const user_id = req.user_id
    // if(user_id === undefined || user_id === ''){
    //     var responce = {
    //         status: 403,
    //         message: 'User not authorised.',
    //     }
    //     return res.status(403).send(responce);
    // }
    const { whatsNew_id } = req.body;

    const result = await whatsNewModal.deleteOne({
      _id: new ObjectId(whatsNew_id),
    });
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

module.exports = { addWhatsNew, getWhatsNew, deleteWhatsNew };
