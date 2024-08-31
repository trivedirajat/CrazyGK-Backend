var questionModel = require('../models/questions');

async function addQuestion(req, res) {
  try {
    const { question, options, answers, marks } = req.body;
    const questionResponse = questionModel.create({
      question,
      options,
      answers,
      marks,
    });
    if (questionResponse) {
      return res.status(200).send({
        status: 200,
        message: `Questions added Successfully.`,
        data: questionResponse,
      });
    } else {
      return res.status(400).send({
        status: 400,
        message: 'Failed to add Questions.',
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

async function editQuestion(req, res) {
  const questionResponse = questionModel.findOne({
    question,
    options,
    answers,
    marks,
  });
    console.log("")
}

module.exports = { addQuestion, editQuestion };
