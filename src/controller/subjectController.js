const subjects = require("../models/subjects");
const { ObjectId } = require("mongodb");
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
async function editSubject(req, res) {
  try {
    const { id } = req.params;
    const subject_id = id;

    if (!subject_id) {
      return res
        .status(400)
        .json({ status: 400, message: "Subject ID is required." });
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

    const updatedSubject = await subjects.updateOne(
      { _id: new ObjectId(subject_id) },
      req.body,
      { new: true }
    );

    if (updatedSubject.nModified === 0) {
      return res.status(404).json({
        status: 404,
        message: "Subject not found or no changes made.",
      });
    }

    return res.status(200).json({
      status: 200,
      message: "Subject updated successfully",
    });
  } catch (error) {
    console.log("error", error.message);
    return res
      .status(500)
      .json({ status: 500, message: "Internal Server Error" });
  }
}

async function getSubjects(req, res) {
  try {
    const { limit = 10, offset = 0, subject_name = "", subject_id } = req.query;
    const page = Math.max(0, Number(offset));
    const perPage = Math.max(1, Number(limit));

    let query = {};
    if (subject_name.trim()) {
      query.subject_name = { $regex: new RegExp(subject_name, "ig") };
    }
    if (subject_id) {
      query._id = subject_id;
    }

    const result = await subjects
      .find(query)
      .skip(perPage * page)
      .limit(perPage)
      .sort({ subject_name: "asc" })
      .exec();

    const total = await subjects.countDocuments(query);

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
        message: "No subjects found.",
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
async function getSubjectById(req, res) {
  try {
    const { id } = req.params;
    if (!id) {
      return res
        .status(400)
        .json({ status: 400, message: "Subject ID is required." });
    }
    const subject_id = id;
    const result = await subjects.findOne({ _id: new ObjectId(subject_id) });
    if (result) {
      return res.status(200).json({
        status: 200,
        message: "Success",
        data: result,
      });
    } else {
      return res.status(404).json({
        status: 404,
        message: "Subject not found.",
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
async function getallsubjectname(req, res) {
  try {
    const result = await subjects.find({}).select({ subject_name: 1 });
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
async function deleteSubjects(req, res) {
  try {
    const { id } = req.params;
    if (!id) {
      return res
        .status(400)
        .json({ status: 400, message: "Subject ID is required." });
    }
    const subject_id = id;
    const result = await subjects.deleteOne({ _id: new ObjectId(subject_id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        status: 404,
        message: "Subject not found or no changes made.",
      });
    }
    const response = {
      status: 200,
      message: "Success.",
    };
    return res.status(200).send(response);
  } catch (error) {
    console.log("error", error.message);
    const responce = {
      status: 501,
      message: "Internal Server Error",
    };
    return res.status(501).send(responce);
  }
}

module.exports = {
  addSubjects,
  getSubjects,
  deleteSubjects,
  editSubject,
  getSubjectById,
  getallsubjectname,
};
