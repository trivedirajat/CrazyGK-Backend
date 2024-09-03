const { default: mongoose } = require("mongoose");
var quizModel = require("../models/quiz");

async function addQuiz(req, res) {
  try {
    // const user_id = req?.user_id || req?.user?.user_id
    // console.log("user_id",user_id)
    // if (!user_id) {
    //   var responce = {
    //     status: 403,
    //     message: 'User not authorised.',
    //   };
    //   return res.status(403).send(responce);
    // }

    const {
      name,
      description,
      questionList,
      totalMarks,
      subject,
      isPublished,
    } = req.body;
    const quizResponse = await quizModel.create({
      name,
      description,
      questionList,
      totalMarks,
      isPublished,
      subject: new mongoose.Types.ObjectId(subject),
    });
    if (quizResponse) {
      return res.status(200).send({
        status: 200,
        message: `Quiz added Successfully.`,
        data: quizResponse,
      });
    } else {
      return res.status(400).send({
        status: 400,
        message: "Failed to add quiz.",
      });
    }
  } catch (error) {
    var responce = {
      status: 501,
      message: "Internal Server Error",
      error,
    };
    return res.status(501).send(responce);
  }
}

async function getAllQuiz(req, res) {
  try {
    let { id } = req.body;
    if (id) {
      const quizResponse = await quizModel.findById(id);
      if (quizResponse) {
        return res.status(200).send({
          status: 200,
          message: `Quiz fetched Successfully.`,
          data: quizResponse,
        });
      }
      return res.status(400).send({
        status: 400,
        message: "Failed to fetch quiz.",
      });
    }
    let { page, limit } = req.query;
    if (page <= 1) {
      page = 0;
    }
    if (limit > 20) {
      limit = 20;
    }
    const quizResponse = await quizModel
      .find()
      .populate({
        path: "subject",
        model: "subjects",
        select: "subject_name",
      })
      .limit(limit)
      .skip(page * limit);
    if (quizResponse) {
      return res.status(200).send({
        status: 200,
        message: `Quiz fetched Successfully.`,
        data: quizResponse,
      });
    }
    return res.status(400).send({
      status: 400,
      message: "Failed to fetch quiz.",
    });
  } catch (error) {
    const responce = {
      status: 501,
      message: "Internal Server Error",
    };
    return res.status(501).send(responce);
  }
}
async function getQuizWithSubject(req, res) {
  try {
    let { page, limit } = req.query;
    if (page <= 1) {
      page = 0;
    }
    if (limit > 20) {
      limit = 20;
    }
    const quizResponse = await quizModel
      .find()
      .populate({
        path: "subject",
        model: "subjects",
        select: "subject_name",
      })
      .limit(limit)
      .skip(page * limit)
      .then((quizzes) => quizzes.map((quiz) => quiz.subject));
    if (quizResponse) {
      return res.status(200).send({
        status: 200,
        message: `Quiz fetched Successfully.`,
        data: quizResponse,
      });
    }
    return res.status(400).send({
      status: 400,
      message: "Failed to fetch quiz.",
    });
  } catch (error) {
    const responce = {
      status: 501,
      message: "Internal Server Error",
    };
    return res.status(501).send(responce);
  }
}
async function getQuizBySubjectId(req, res) {
  try {
    const quizResponse = await quizModel
      .find({ subject: req.params.id, isPublished: true })
      .populate({
        path: "subject",
        model: "subjects",
        select: "subject_name",
      });
    if (quizResponse) {
      return res.status(200).send({
        status: 200,
        message: `Quiz fetched Successfully.`,
        data: quizResponse,
      });
    }
    return res.status(400).send({
      status: 400,
      message: "Failed to fetch quiz.",
    });
  } catch (error) {
    const responce = {
      status: 501,
      message: "Internal Server Error",
    };
    return res.status(501).send(responce);
  }
}
async function startQuiz(req, res) {
  try {
    const quizResponse = await quizModel
      .find({ subject: req.params.id, isPublished: true })
      .populate({
        path: "subject",
        model: "subjects",
        select: "subject_name",
      })
      .populate("questionList");

    if (quizResponse) {
      const sanitizedResponse = quizResponse.map((quiz) => {
        const sanitizedQuestions = quiz.questionList.map((question) => {
          const sanitizedOptions = question.options.map((option) => {
            const { isCorrect, ...sanitizedOption } = option._doc;
            return sanitizedOption;
          });
          return { ...question._doc, options: sanitizedOptions };
        });

        return { ...quiz._doc, questionList: sanitizedQuestions };
      });

      return res.status(200).send({
        status: 200,
        message: `Quiz fetched Successfully.`,
        data: sanitizedResponse,
      });
    }

    return res.status(400).send({
      status: 400,
      message: "Failed to fetch quiz.",
    });
  } catch (error) {
    const response = {
      status: 501,
      message: "Internal Server Error",
    };
    return res.status(501).send(response);
  }
}

async function UpdateQuiz(req, res) {
  try {
    const {
      name,
      description,
      questionList,
      totalMarks,
      subject,
      isPublished,
    } = req.body;
    const quizResponse = await quizModel.findByIdAndUpdate(
      req.params.id,
      {
        name,
        description,
        questionList,
        totalMarks,
        isPublished,
        subject: new mongoose.Types.ObjectId(subject),
      },
      { new: true }
    );
    if (quizResponse) {
      return res.status(200).send({
        status: 200,
        message: `Quiz updated Successfully.`,
        data: quizResponse,
      });
    } else {
      return res.status(400).send({
        status: 400,
        message: "Failed to update quiz.",
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
async function deleteQuiz(req, res) {
  try {
    const quizResponse = await quizModel.findByIdAndDelete(req.params.id);
    if (quizResponse) {
      return res.status(200).send({
        status: 200,
        message: `Quiz deleted Successfully.`,
        Success: true,
      });
    } else {
      return res.status(400).send({
        status: 400,
        message: "Failed to delete quiz.",
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
  addQuiz,
  getAllQuiz,
  UpdateQuiz,
  deleteQuiz,
  getQuizWithSubject,
  getQuizBySubjectId,
  startQuiz,
};
