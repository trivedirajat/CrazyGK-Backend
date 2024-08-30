var quizModel = require('../models/quiz');

async function addQuiz(req, res) {
  try {
    const user_id = req?.user_id || req?.user?.user_id
    console.log("user_id",user_id)
    if (!user_id) {
      var responce = {
        status: 403,
        message: 'User not authorised.',
      };
      return res.status(403).send(responce);
    }

    const { name, description, questionList, totalMarks } = req.body;
    const quizResponse = quizModel.create({
      name,
      description,
      questionList,
      totalMarks,
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
        message: 'Failed to add quiz.',
      });
    }
  } catch (error) {
    var responce = {
      status: 501,
      message: 'Internal Server Error',
    };
    return res.status(501).send(responce);
  }
}

module.exports = { addQuiz };
