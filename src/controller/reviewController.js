const { s3UploadImage, uploadAndSaveImage } = require("../helper/helper");
const path = require("path");
const fs = require("fs");
const reviewModal = require("../models/reviewModal");
var { ObjectId } = require("mongodb");

async function addReview(req, res) {
  try {
    const { review, rating, review_id } = req.body;
    if (review != "" || rating != "") {
      if (
        req.files &&
        typeof req.files.user_profile != undefined &&
        req.files.user_profile != null
      ) {
        req.body.user_profile = req.files.user_profile[0].filename;
        bucketFilePath = "profile/" + req.files.user_profile[0].filename;
        const localFilePath =
          req.files.user_profile[0].destination +
          req.files.user_profile[0].filename;
        const imageUpload = await s3UploadImage(localFilePath, bucketFilePath);
        req.body.user_profile = bucketFilePath;
      }

      if (review_id != undefined && review_id != "") {
        var result = await reviewModal.updateOne(
          { _id: new ObjectId(review_id) },
          req.body
        );
        if (result) {
          var results = await reviewModal.find({
            _id: new ObjectId(review_id),
          });
          var response = {
            status: 200,
            message: `Review update Successfully`,
            data: results[0],
          };
          return res.status(200).send(response);
        } else {
          var response = {
            status: 201,
            message: `Review update Failed.`,
          };
          return res.status(201).send(response);
        }
      } else {
        req.body.user_id = user_id;
        var result = await reviewModal.create(req.body);
        if (result) {
          var response = {
            status: 200,
            message: `Review add Successfully.`,
            data: result,
          };
          return res.status(200).send(response);
        } else {
          var response = {
            status: 201,
            message: `Review add Failed.`,
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
const createReview = async (req, res) => {
  try {
    const { name, review, rating } = req.body;
    let imageUrl = null;

    // Check if there's an image to upload
    if (req.files && req.files.user_profile) {
      const uploadResult = await uploadAndSaveImage(
        req,
        "user_profile",
        "public/assets/reviews"
      );
      if (!uploadResult.success) {
        return res
          .status(500)
          .json({ status: 500, message: uploadResult.message });
      }
      imageUrl = uploadResult.imageUrl;
      req.body.image = imageUrl;
    }

    const newReview = new reviewModal({
      name,
      review,
      rating,
      user_profile: imageUrl,
    });

    await newReview.save();
    res
      .status(201)
      .json({ message: "Review created successfully", newReview, status: 201 });
  } catch (err) {
    console.log("🚀 ~ createReview ~ err:", err);
    res
      .status(500)
      .json({ message: "Error creating review", error: err.message });
  }
};

const getReviews = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  try {
    const reviews = await reviewModal
      .find()
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .exec();

    const totalReviews = await reviewModal.countDocuments();

    res.json({
      reviews,
      totalPages: Math.ceil(totalReviews / limit),
      currentPage: parseInt(page),
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching reviews", error: err.message });
  }
};
const getReviewbyId = async (req, res) => {
  const { review_id } = req.query;
  try {
    const review = await reviewModal.findById(review_id);
    if (review) {
      const response = {
        status: 200,
        message: "Success.",
        data: review,
      };
      return res.status(200).send(response);
    } else {
      const response = {
        status: 201,
        message: "Failed.",
      };
      return res.status(201).send(response);
    }
  } catch (error) {
    console.log("error", error.message);
    const responce = {
      status: 501,
      message: "Internal Server Error",
    };
    return res.status(501).send(responce);
  }
};
const updateReview = async (req, res) => {
  const { name, review, rating } = req.body;
  const { id } = req.params;

  try {
    let imageUrl = null;

    if (req.files && req.files.user_profile) {
      const uploadResult = await uploadAndSaveImage(
        req,
        "user_profile",
        "public/assets/reviews"
      );
      if (!uploadResult.success) {
        return res
          .status(500)
          .json({ status: 500, message: uploadResult.message });
      }
      imageUrl = uploadResult.imageUrl;
      req.body.image = imageUrl;
    }

    const updatedReview = await reviewModal.findByIdAndUpdate(
      id,
      {
        name,
        review,
        rating,
        user_profile: imageUrl || undefined,
      },
      { new: true }
    );

    if (updatedReview) {
      return res.status(200).json({
        status: 200,
        message: "Review updated successfully.",
        data: updatedReview,
      });
    } else {
      return res.status(404).json({
        status: 404,
        message: "Review not found.",
      });
    }
  } catch (error) {
    console.log("🚀 ~ updateReview ~ error:", error);
    return res.status(500).json({
      status: 500,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

async function reviewDelete(req, res) {
  try {
    const { id } = req.params;
    if (id != "") {
      await reviewModal.findByIdAndDelete(id);
      var response = {
        status: 200,
        message: "Success.",
      };
      return res.status(200).send(response);
    } else {
      var response = {
        status: 201,
        message: "id Can not be empty value.",
      };
      return res.status(404).send(response);
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
  addReview,
  getReviews,
  reviewDelete,
  createReview,
  getReviewbyId,
  updateReview,
};
