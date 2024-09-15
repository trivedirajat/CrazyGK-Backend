var subjects = require("../models/subjects");
var { ObjectId } = require("mongodb");
const { s3UploadImage, fileRemovePath } = require("../helper/helper");
const path = require("path");
const { uploadAndSaveImage } = require("../helper/helper");

async function addSubjects(req, res) {
  try {
    const { subject_name, subject_id, description } = req.body;

    if (!subject_name || subject_name === "") {
      return res
        .status(400)
        .json({ status: 400, message: "Subject name cannot be empty." });
    }

    let imageUrl = null;
    if (req.files && req.files.image) {
      const uploadResult = await uploadAndSaveImage(
        req,
        "image",
        "public/assets/subjects"
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

    // Update existing subject
    if (subject_id) {
      result = await subjects.updateOne(
        { _id: new ObjectId(subject_id) },
        req.body
      );
      msg = "Update";
    } else {
      // Create new subject
      const existingSubject = await subjects.find({ subject_name });
      if (existingSubject.length > 0) {
        return res
          .status(400)
          .json({ status: 400, message: "This subject already exists." });
      }
      result = await subjects.create(req.body);
      msg = "Add";
    }

    if (result) {
      return res.status(200).json({
        status: 200,
        message: `${msg} Successfully`,
        data: result,
        imageUrl,
      });
    } else {
      return res.status(500).json({ status: 500, message: `${msg} Failed.` });
    }
  } catch (error) {
    console.log("error", error.message);
    return res
      .status(500)
      .json({ status: 500, message: "Internal Server Error" });
  }
}
async function getSubjects(req, res) {
  try {
    const user_id = req.user_id;
    // if(user_id != undefined || user_id != ''){
    //     var responce = {
    //         status: 403,
    //         message: 'User not authorised.',
    //     }
    //     return res.status(403).send(responce);
    // }
    const { limit = 400, offset = 0, subject_name, subject_id } = req.body;
    const page = Math.max(0, Number(offset));

    let query = {};
    if (subject_name != undefined && subject_name != "") {
      query.subject_name = { $regex: new RegExp(subject_name, "ig") };
    }
    if (subject_id != undefined && subject_id != "") {
      query._id = subject_id;
    }

    const result = await subjects
      .find(query)
      .skip(Number(limit) * page)
      .limit(Number(limit))
      .sort({ subject_name: "asc" })
      .exec();
    if (result.length > 0) {
      const total = await subjects.count(query);

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
async function deleteSubjects(req, res) {
  try {
    const user_id = req.user_id;
    // if(user_id != undefined || user_id != ''){
    //     var responce = {
    //         status: 403,
    //         message: 'User not authorised.',
    //     }
    //     return res.status(403).send(responce);
    // }
    const { subject_id } = req.body;

    const result = await subjects.deleteOne({ _id: new ObjectId(subject_id) });
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

module.exports = { addSubjects, getSubjects, deleteSubjects };
