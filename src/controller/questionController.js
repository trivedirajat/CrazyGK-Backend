var questionModel = require('../models/questions');
const mongoose = require('mongoose');
async function addQuestion(req, res) {
  try {
    const { question, options, marks } = req.body;
    const questionResponse = await questionModel.create({
      question,
      options,
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

async function getAllQuestion(req, res) {
  try {
    let { id } = req.params;
    if (id) {
      console.log(
        'new mongoose.Types.ObjectId(id),',
        new mongoose.Types.ObjectId(id)
      );
      const questionResponse = await questionModel.findOne({
        _id: new mongoose.Types.ObjectId(id),
      });
      console.log('questionResponse', questionResponse);
      if (questionResponse) {
        return res.status(200).send({
          status: 200,
          message: `Questions fetched Successfully.`,
          data: questionResponse,
        });
      }
      return res.status(400).send({
        status: 400,
        message: 'Failed to fetch Questions.',
      });
    }
    let { page, limit } = req.query;
    if (page <= 1) {
      page = 0;
    }
    if (limit > 20) {
      limit = 20;
    }
    const questionResponse = await questionModel
      .find()
      .limit(limit)
      .skip(limit * page);
    const questionCount = await questionModel.count();
    if (questionResponse) {
      return res.status(200).send({
        status: 200,
        message: `Questions fetched Successfully.`,
        data: questionResponse,
        count: questionCount,
      });
    } else {
      return res.status(400).send({
        status: 400,
        message: 'Failed to fetch Questions.',
      });
    }
  } catch (error) {
    console.log('Error', error);
    var responce = {
      status: 501,
      message: 'Internal Server Error',
    };
    return res.status(501).send(responce);
  }
}

async function editQuestion(req, res) {
  try {
    const questionResponse = await questionModel.findOne({
      _id: new ObjectId(id),
    });
    const { question, options, marks } = req.body;
    console.log('questionResponse', questionResponse);
    questionResponse.question = question;
    questionResponse.options = options;
    questionResponse.marks = marks;
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
        message: 'Failed to update Questions.',
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

async function deleteQuestion(req, res) {
  try {
    const questionResponse = await questionModel.deleteOne();
    console.log('questionResponse', questionResponse);
    if (questionResponse?.deletedCount > 0) {
      return res.status(200).send({
        status: 200,
        message: `Questions deleted Successfully.`,
        data: questionResponse,
      });
    } else {
      return res.status(400).send({
        status: 400,
        message: 'Failed to delete Questions.',
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

module.exports = { addQuestion, editQuestion, deleteQuestion, getAllQuestion };
