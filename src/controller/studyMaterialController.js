const studyMaterialModal = require("../models/studyMaterialModal");
const subjectTopics = require("../models/subjectTopics");
var { ObjectId } = require("mongodb");

// async function addStudyMaterial(req, res) {
//   try {
//     const user_id = req.user_id;
//     // if(user_id != undefined || user_id != ''){
//     //     var responce = {
//     //         status: 403,
//     //         message: 'User not authorised.',
//     //     }
//     //     return res.status(403).send(responce);
//     // }
//     const { title, description, subject_id, material_id } = req.body;
//     if (title != "" && subject_id != "") {
//       if (material_id != undefined && material_id != "") {
//         var result = await studyMaterialModal.updateOne(
//           { _id: material_id },
//           req.body
//         );
//         if (result) {
//           var results = await studyMaterialModal.find({ _id: material_id });
//           var response = {
//             status: 200,
//             message: `Study material update Successfully`,
//             data: results,
//           };
//           return res.status(200).send(response);
//         } else {
//           var response = {
//             status: 201,
//             message: `Study material update Failed.`,
//           };
//           return res.status(201).send(response);
//         }
//       } else {
//         var chkPln = await studyMaterialModal.find({ title: title });
//         if (chkPln.length > 0) {
//           var response = {
//             status: 201,
//             message: `This study material already available.`,
//           };
//           return res.status(201).send(response);
//         }
//         var result = await studyMaterialModal.create(req.body);
//         if (result) {
//           var response = {
//             status: 200,
//             message: `Study material add Successfully.`,
//             data: result,
//           };
//           return res.status(200).send(response);
//         } else {
//           var response = {
//             status: 201,
//             message: `Study material add Failed.`,
//           };
//           return res.status(201).send(response);
//         }
//       }
//     } else {
//       var response = {
//         status: 201,
//         message: "Can not be empty value.",
//       };
//       return res.status(201).send(response);
//     }
//   } catch (error) {
//     console.log("error", error.message);
//     var responce = {
//       status: 501,
//       message: "Internal Server Error",
//     };
//     return res.status(501).send(responce);
//   }
// }

const addStudyMaterial = async (req, res) => {
  try {
    const { topic_name, containt, subject_id, status } = req.body;

    if (!topic_name || !containt || !subject_id) {
      return res
        .status(400)
        .json({ message: "Title, containt, and subject are required" });
    }

    const newStudyMaterial = new studyMaterialModal({
      topic_name,
      containt,
      subject_id,
      status: status !== undefined ? status : true,
    });

    // Save to database
    await newStudyMaterial.save();

    // Return success response
    return res.status(201).json({
      message: "Study material added successfully",
      data: newStudyMaterial,
    });
  } catch (error) {
    // Handle errors and return error response
    console.error("Error adding study material:", error);
    return res
      .status(500)
      .json({ message: "An error occurred while adding study material" });
  }
};
const editStudyMaterial = async (req, res) => {
  try {
    const { id } = req.params;
    const { topic_name, containt, subject_id, status } = req.body;

    if (!id) {
      return res.status(400).json({ message: "Study material ID is required" });
    }

    if (!topic_name || !containt || !subject_id) {
      return res
        .status(400)
        .json({ message: "Title, content, and subject are required" });
    }

    const studyMaterial = await studyMaterialModal.findById(id);

    if (!studyMaterial) {
      return res.status(404).json({ message: "Study material not found" });
    }

    studyMaterial.topic_name = topic_name;
    studyMaterial.containt = containt;
    studyMaterial.subject_id = subject_id;
    studyMaterial.status = status !== undefined ? status : true;

    const updatedStudyMaterial = await studyMaterial.save();

    return res.status(200).json({
      message: "Study material updated successfully",
      data: updatedStudyMaterial,
    });
  } catch (error) {
    console.error("Error updating study material:", error);
    return res
      .status(500)
      .json({ message: "An error occurred while updating study material" });
  }
};
const deleteStudyMaterial = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "Study material ID is required" });
    }

    const deletedStudyMaterial = await studyMaterialModal.findByIdAndDelete(id);

    if (!deletedStudyMaterial) {
      return res.status(404).json({ message: "Study material not found" });
    }

    return res.status(200).json({
      message: "Study material deleted successfully",
      data: deletedStudyMaterial,
    });
  } catch (error) {
    console.error("Error deleting study material:", error);
    return res
      .status(500)
      .json({ message: "An error occurred while deleting study material" });
  }
};

async function getStudyMaterial(req, res) {
  try {
    const user_id = req.user_id;
    // if(user_id != undefined || user_id != ''){
    //     var responce = {
    //         status: 403,
    //         message: 'User not authorised.',
    //     }
    //     return res.status(403).send(responce);
    // }
    const { limit = 30, offset = 0, search_title } = req.body;
    const page = Math.max(0, Number(offset));
    let query = {};
    if (search_title != undefined && search_title != "") {
      query.title = { $regex: new RegExp(search_title, "ig") };
    }
    const result = await studyMaterialModal.aggregate([
      { $match: query },
      {
        $lookup: {
          from: "subjects",
          localField: "subject_id",
          foreignField: "_id",
          as: "subjects",
        },
      },
      { $unwind: "$subjects" },
      {
        $project: {
          _id: 1,
          title: 1,
          description: 1,
          subject_id: 1,
          status: 1,
          subject_name: "$subjects.subject_name",
        },
      },
    ]);
    //  .skip(Number(limit) * page).limit(Number(limit)).sort({ '_id': -1 }).exec();

    if (result.length > 0) {
      var response = {
        status: 200,
        message: "Success.",
        data: result,
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

async function addSubjectTopics(req, res) {
  try {
    const user_id = req.user_id;
    // if(user_id != undefined || user_id != ''){
    //     var responce = {
    //         status: 403,
    //         message: 'User not authorised.',
    //     }
    //     return res.status(403).send(responce);
    // }
    const { topic_name, containt, subject_id, material_id, topic_id } =
      req.body;
    console.log("req.body: ", req.body);
    if (topic_name != "" && subject_id != "") {
      if (topic_id != undefined && topic_id != "") {
        var result = await subjectTopics.updateOne(
          { _id: new ObjectId(topic_id) },
          req.body
        );
        if (result) {
          var results = await subjectTopics.find({
            _id: new ObjectId(topic_id),
          });
          var response = {
            status: 200,
            message: `Subject topics update Successfully`,
            data: results,
          };
          return res.status(200).send(response);
        } else {
          var response = {
            status: 201,
            message: `Subject topics update Failed.`,
          };
          return res.status(201).send(response);
        }
      } else {
        var chkPln = await subjectTopics.find({ topic_name: topic_name });
        if (chkPln.length > 0) {
          var response = {
            status: 201,
            message: `This subject topics already available.`,
          };
          return res.status(201).send(response);
        }
        var result = await subjectTopics.create(req.body);
        if (result) {
          var response = {
            status: 200,
            message: `Subject topics add Successfully.`,
            data: result,
          };
          return res.status(200).send(response);
        } else {
          var response = {
            status: 201,
            message: `Study material add Failed.`,
          };
          return res.status(201).send(response);
        }
      }
    } else {
      var response = {
        status: 201,
        message: "Can not be empty value.",
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
async function editSubjectTopics(req, res) {
  try {
    const { topic_name, subject_id, id, containt } = req.body;

    if (!topic_name || !subject_id) {
      return res.status(400).json({
        message: "Both topic_name and subject_id are required.",
      });
    }

    if (!id || !ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Valid study_material_id is required.",
      });
    }

    const result = await subjectTopics.findByIdAndUpdate(
      id,
      { $set: { topic_name, subject_id, containt } },
      { new: true, runValidators: true }
    );
    console.log("🚀 ~ editSubjectTopics ~ result:", result);

    if (result.matchedCount === 0) {
      return res.status(404).json({
        message: "Study material not found or no changes made.",
      });
    }

    if (result) {
      return res.status(200).json({
        message: "Subject topics updated successfully.",
        data: result,
        status: 200,
      });
    } else {
      return res.status(404).json({
        message: "No changes made to the subject topics.",
      });
    }
  } catch (error) {
    console.error("Error updating subject topics:", error);
    return res.status(500).json({
      message: "Internal server error.",
    });
  }
}
async function getSubjectTopics(req, res) {
  try {
    const user_id = req.user_id;
    // if(user_id != undefined || user_id != ''){
    //     var responce = {
    //         status: 403,
    //         message: 'User not authorised.',
    //     }
    //     return res.status(403).send(responce);
    // }
    const { limit = 30, offset = 0, subject_id, topic_name } = req.body;
    const page = Math.max(0, Number(offset));
    let query = {};
    if (subject_id != undefined && subject_id != "") {
      query = { subject_id: new ObjectId(subject_id) };
    }
    if (topic_name != undefined && topic_name != "") {
      query.topic_name = { $regex: new RegExp(topic_name, "ig") };
    }
    const result = await subjectTopics.aggregate([
      { $match: query },
      {
        $lookup: {
          from: "subjects",
          localField: "subject_id",
          foreignField: "_id",
          as: "subjects",
        },
      },
      { $unwind: "$subjects" },
      {
        $project: {
          _id: 1,
          topic_name: 1,
          containt: 1,
          subject_id: 1,
          status: 1,
          subject_name: "$subjects.subject_name",
        },
      },
    ]);
    //  .skip(Number(limit) * page).limit(Number(limit)).sort({ '_id': -1 }).exec();

    if (result.length > 0) {
      var response = {
        status: 200,
        message: "Success.",
        data: result,
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
async function getStudyById(req, res) {
  try {
    const { id } = req.params;

    const study_id = id;
    if (!study_id) {
      return res.status(400).json({
        status: 400,
        message: "Bad Request: 'study_id' query parameter is required.",
      });
    }

    const result = await studyMaterialModal.findById(study_id);

    if (result) {
      return res.status(200).json({
        status: 200,
        message: "Success",
        data: result,
      });
    } else {
      return res.status(404).json({
        status: 404,
        message: "Not found",
      });
    }
  } catch (error) {
    // Handle unexpected errors
    return res.status(500).json({
      status: 500,
      message: "Internal Server Error",
      error: error.message,
    });
  }
}
const getAllStudyMaterials = async (req, res) => {
  try {
    const {
      limit = 10,
      page = 1,
      getactualcontent = false,
      subject_id,
      material_id,
    } = req.query;

    const perPage = Math.max(1, Number(limit));
    const currentPage = Math.max(1, Number(page)) - 1;

    let query = {};

    if (subject_id) {
      query.subject_id = subject_id;
    }
    if (material_id) {
      query.material_id = material_id;
    }

    const projection = getactualcontent ? {} : { containt: 0 };

    const studyMaterials = await studyMaterialModal
      .find(query)
      .select(projection)
      .skip(perPage * currentPage)
      .limit(perPage)
      .sort({ createdDate: "asc" })
      .populate({
        path: "subject_id",
        select: "_id subject_name",
      })
      .exec();

    const totalMaterials = await studyMaterialModal.countDocuments(query);

    if (studyMaterials.length > 0) {
      return res.status(200).json({
        success: true,
        message: "Study materials fetched successfully",
        data: studyMaterials,
        total_data: totalMaterials,
        current_page: currentPage + 1,
        per_page: perPage,
        total_pages: Math.ceil(totalMaterials / perPage),
      });
    } else {
      return res.status(404).json({
        success: false,
        message: "No study materials found",
      });
    }
  } catch (error) {
    console.error("Error fetching study materials:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

async function deleteSubjectTopics(req, res) {
  try {
    const user_id = req.user_id;
    // if(user_id != undefined || user_id != ''){
    //     var responce = {
    //         status: 403,
    //         message: 'User not authorised.',
    //     }
    //     return res.status(403).send(responce);
    // }
    const { topic_id } = req.body;
    if (topic_id != undefined) {
      const result = await subjectTopics.deleteOne({
        _id: new ObjectId(topic_id),
      });
      if (result) {
        var response = {
          status: 200,
          message: "Success.",
        };
        return res.status(200).send(response);
      } else {
        var response = {
          status: 201,
          message: "Failed.",
        };
        return res.status(201).send(response);
      }
    } else {
      var response = {
        status: 201,
        message: "Can not be empty valuee.",
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
module.exports = {
  addStudyMaterial,
  getStudyMaterial,
  deleteStudyMaterial,
  addSubjectTopics,
  getSubjectTopics,
  editSubjectTopics,
  deleteSubjectTopics,
  getStudyById,
  getAllStudyMaterials,
  editStudyMaterial,
};
