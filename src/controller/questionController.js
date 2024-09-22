var questionModel = require("../models/questions");
const mongoose = require("mongoose");
async function addQuestion(req, res) {
  try {
    const { questions } = req.body;
    const questionResponse = await questionModel.insertMany(questions);
    if (questionResponse) {
      return res.status(200).send({
        status: 200,
        message: `Questions added Successfully.`,
        data: questionResponse,
      });
    } else {
      return res.status(400).send({
        status: 400,
        message: "Failed to add Questions.",
      });
    }
  } catch (error) {
    var responce = {
      status: 501,
      message: "Internal Server Error",
    };
    return res.status(501).send(responce);
  }
}

async function getAllQuestion(req, res) {
  try {
    const { id } = req.params;

    if (id) {
      const questionResponse = await questionModel
        .findOne({ _id: new mongoose.Types.ObjectId(id) })
        .populate({
          path: "subject",
          select: "subject_name",
        });

      if (questionResponse) {
        return res.status(200).send({
          status: 200,
          message: "Question fetched successfully.",
          data: questionResponse,
        });
      }

      return res.status(404).send({
        status: 404,
        message: "Question not found.",
      });
    }

    // Fetch all questions with pagination
    let { page = 0, limit = 10 } = req.query;
    page = Math.max(0, page);
    limit = Math.max(1, Number(limit));

    const questions = await questionModel
      .find()
      .skip(limit * page)
      .limit(limit)
      .sort({ createdDate: "desc" })
      .populate({
        path: "subject",
        select: "_id subject_name",
      })
      .exec();

    const totalQuestions = await questionModel.countDocuments();

    return res.status(200).send({
      status: 200,
      message: "Questions fetched successfully.",
      data: questions,
      total: totalQuestions,
      total_data: totalQuestions,
      current_page: page,
      per_page: limit,
      total_pages: Math.ceil(totalQuestions / limit),
    });
  } catch (error) {
    console.error("Error fetching questions:", error);
    return res.status(500).send({
      status: 500,
      message: "Internal Server Error",
    });
  }
}

async function getQuestionsListbySubjectid(req, res) {
  try {
    let { subjectId } = req.params;
    const questionResponse = await questionModel
      .find({
        subject: new mongoose.Types.ObjectId(subjectId),
        isPublished: true,
      })
      .populate({
        path: "subject",
        model: "subjects",
        select: "subject_name",
      });
    if (questionResponse) {
      return res.status(200).send({
        status: 200,
        message: `Questions fetched Successfully.`,
        data: questionResponse,
      });
    } else {
      return res.status(400).send({
        status: 400,
        message: "Failed to fetch Questions.",
      });
    }
  } catch (error) {
    console.log("Error", error);
    const responce = {
      status: 501,
      message: "Internal Server Error",
    };
    return res.status(501).send(responce);
  }
}
async function editQuestion(req, res) {
  let { id } = req.params;
  try {
    const questionResponse = await questionModel.findById(id);
    const { question, options, marks, isPublished, time, subject } = req.body;
    questionResponse.question = question;
    questionResponse.options = options;
    questionResponse.marks = marks;
    questionResponse.isPublished = isPublished;
    questionResponse.time = time;
    questionResponse.subject = new mongoose.Types.ObjectId(subject);
    const updatedQuestionsResponse = await questionResponse.save();
    if (updatedQuestionsResponse) {
      return res.status(200).send({
        status: 200,
        message: `Questions updated Successfully.`,
        data: updatedQuestionsResponse,
      });
    } else {
      return res.status(400).send({
        status: 400,
        message: "Failed to update Questions.",
      });
    }
  } catch (error) {
    console.log("🚀 ~ editQuestion ~ error:", error);
    var responce = {
      status: 501,
      message: "Internal Server Error",
    };
    return res.status(501).send(responce);
  }
}

async function deleteQuestion(req, res) {
  const { id } = req.params;
  try {
    const questionResponse = await questionModel.findByIdAndDelete(id);
    if (questionResponse) {
      return res.status(200).send({
        status: 200,
        message: `Questions deleted Successfully.`,
        data: questionResponse,
      });
    } else {
      return res.status(400).send({
        status: 400,
        message: "Failed to delete Questions.",
      });
    }
  } catch (error) {
    var responce = {
      status: 501,
      message: "Internal Server Error",
    };
    return res.status(501).send(responce);
  }
}

module.exports = {
  addQuestion,
  editQuestion,
  deleteQuestion,
  getAllQuestion,
  getQuestionsListbySubjectid,
};
