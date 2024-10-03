const {
  s3UploadImage,
  uploadAndSaveImage,
  isValidObjectId,
} = require("../helper/helper");
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
    const { name, review, rating, is_feature } = req.body;
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

    const newReview = new reviewModal({
      name,
      review,
      rating,
      is_feature,
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
  try {
    const {
      limit = 10,
      offset = 0,
      name = "",
      rating = "",
      feature_only = "",
    } = req.query;
    const pageNum = Math.max(0, Number(offset) - 1);
    const perPage = Math.max(1, Number(limit));

    let query = {};

    if (name.trim()) {
      query.name = { $regex: new RegExp(name, "i") };
    }

    if (rating) {
      query.rating = Number(rating);
    }

    if (feature_only) {
      query.is_feature = true;
    }

    const reviews = await reviewModal
      .find(query)
      .skip(perPage * pageNum)
      .limit(perPage)
      .sort({ createdDate: "desc" })
      .populate({ path: "user_id", select: "name" })
      .exec();

    const totalReviews = await reviewModal.countDocuments(query); // Total filtered reviews

    if (reviews.length > 0) {
      return res.status(200).json({
        status: 200,
        message: "Success",
        data: reviews,
        total_data: totalReviews,
        current_page: pageNum + 1,
        per_page: perPage,
        total_pages: Math.ceil(totalReviews / perPage),
      });
    } else {
      return res.status(404).json({
        status: 404,
        message: "No reviews found.",
      });
    }
  } catch (error) {
    console.error("Error:", error.message);
    return res.status(500).json({
      status: 500,
      message: "Internal Server Error",
    });
  }
};
const getReviewbyId = async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({
      status: 400,
      message: "Invalid review ID.",
    });
  }
  const review_id = id;
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
  const { name, review, rating, is_feature } = req.body;
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
        is_feature,
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
