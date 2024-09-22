const { isValidObjectId } = require("../helper/helper");
const dalyVocabModal = require("../models/dalyVocabModal");

const addDailyVocab = async (req, res) => {
  const { title, description } = req.body;

  const requiredFields = [
    { name: "title", value: title },
    { name: "description", value: description },
  ];

  for (const field of requiredFields) {
    if (
      !field.value ||
      (typeof field.value === "string" && field.value.trim().length === 0)
    ) {
      return res
        .status(400)
        .json({ error: `${field.name} is required and cannot be empty` });
    }
  }

  try {
    const newVocab = new dalyVocabModal({
      title: title.trim(),
      description: description.trim(),
    });

    const savedVocab = await newVocab.save();
    return res.status(201).json({
      message: "Daily vocabulary added successfully",
      vocab: savedVocab,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ error: error.message });
    }

    console.error("Error adding daily vocabulary:", error);
    return res
      .status(500)
      .json({ error: "An error occurred while adding daily vocabulary" });
  }
};
async function getDailyVocab(req, res) {
  try {
    const { limit = 10, offset = 0, title = "" } = req.query;
    const page = Math.max(0, Number(offset));
    const perPage = Math.max(1, Number(limit));

    let query = {};
    if (title.trim()) {
      query.title = { $regex: new RegExp(title, "i") };
    }

    const result = await dalyVocabModal
      .find(query)
      .skip(perPage * page)
      .limit(perPage)
      .sort({ createdDate: "desc" })
      .exec();

    const total = await dalyVocabModal.countDocuments(query);

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
        message: "No daily vocabulary found.",
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
async function getDailyVocabById(req, res) {
  try {
    const { id } = req.params;

    // Validate the ID
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid ID format." });
    }

    const vocabEntry = await dalyVocabModal.findById(id);

    if (!vocabEntry) {
      return res.status(404).json({
        status: 404,
        message: "Daily vocabulary not found.",
      });
    }

    return res.status(200).json({
      status: 200,
      message: "Success",
      data: vocabEntry,
    });
  } catch (error) {
    console.error("Error:", error.message);
    return res.status(500).json({
      status: 500,
      message: "Internal Server Error",
    });
  }
}
const editDailyVocab = async (req, res) => {
  const { id } = req.params;
  const { title, description } = req.body;

  if (!isValidObjectId(id)) {
    return res.status(400).json({ error: "Invalid ID format" });
  }

  const requiredFields = [
    { name: "title", value: title },
    { name: "description", value: description },
  ];

  for (const field of requiredFields) {
    if (
      !field.value ||
      (typeof field.value === "string" && field.value.trim().length === 0)
    ) {
      return res
        .status(400)
        .json({ error: `${field.name} is required and cannot be empty` });
    }
  }

  try {
    const updatedVocab = await dalyVocabModal.findByIdAndUpdate(
      id,
      { title: title.trim(), description: description.trim() },
      { new: true, runValidators: true }
    );

    if (!updatedVocab) {
      return res.status(404).json({ error: "Daily vocabulary not found" });
    }

    return res.status(200).json({
      message: "Daily vocabulary updated successfully",
      vocab: updatedVocab,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ error: error.message });
    }

    console.error("Error updating daily vocabulary:", error);
    return res
      .status(500)
      .json({ error: "An error occurred while updating daily vocabulary" });
  }
};
async function deleteDalyVocab(req, res) {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({
      status: 400,
      message: "Invalid daily vocabulary ID.",
    });
  }

  try {
    const deletedVocab = await dalyVocabModal.findByIdAndDelete(id);

    if (!deletedVocab) {
      return res.status(404).json({
        status: 404,
        message: "Daily vocabulary not found.",
      });
    }

    return res.status(200).json({
      status: 200,
      message: "Daily vocabulary deleted successfully.",
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
  getDailyVocab,
  getDailyVocabById,
  addDailyVocab,
  editDailyVocab,
  deleteDalyVocab,
};
