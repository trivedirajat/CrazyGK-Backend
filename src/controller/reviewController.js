const { s3UploadImage } = require("../helper/helper");
const path = require("path");
const fs = require("fs");
const reviewModal = require("../models/reviewModal");
var { ObjectId } = require("mongodb");

async function addReview(req, res) {
  try {
    // const user_id = req.user_id
    // if(user_id != undefined || user_id != ''){
    //     var responce = {
    //         status: 403,
    //         message: 'User not authorised.',
    //     }
    //     return res.status(403).send(responce);
    // }

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
    let imagePath = null;

    // Check if there's an image to upload
    if (req.files && req.files.user_profile) {
      const localFilePath = path.join(
        "public/assets/review",
        req.files.user_profile[0].filename
      );
      console.log("🚀 ~ createReview ~ localFilePath:", localFilePath);
      const bucketFilePath = `reviews/${req.files.user_profile[0].filename}`;

      try {
        // Upload to S3
        imagePath = await s3UploadImage(localFilePath, bucketFilePath);
        console.log("🚀 ~ createReview ~ imagePath:", imagePath);

        // If upload is successful, delete the local file
        fs.unlinkSync(localFilePath);
      } catch (s3Error) {
        // On S3 upload failure, still delete the local file
        fs.unlinkSync(localFilePath);
        return res.status(500).json({
          message: "Error uploading image to S3",
          error: s3Error.message,
          status: 500,
        });
      }
    }

    // Create new review with S3 image path
    const newReview = new reviewModal({
      name,
      review,
      rating,
      user_profile: imagePath,
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
// async function getReview(req, res) {
//   try {
//     // const user_id = req.user_id
//     // if(user_id != undefined || user_id != ''){
//     //     var responce = {
//     //         status: 403,
//     //         message: 'User not authorised.',
//     //     }
//     //     return res.status(403).send(responce);
//     // }
//     const { limit = 30, offset = 0, review_id } = req.body;
//     const page = Math.max(0, Number(offset));

//     // const result = await reviewModal.find().skip(Number(limit) * page).limit(Number(limit)).sort({ '_id': -1 }).exec();
//     const result = await reviewModal
//       .aggregate([
//         {
//           $lookup: {
//             from: "users",
//             localField: "user_id",
//             foreignField: "_id",
//             as: "users",
//           },
//         },
//         { $unwind: "$users" },
//         {
//           $project: {
//             _id: 1,
//             review: 1,
//             rating: 1,
//             createdDate: 1,
//             createdDate: 1,
//             user_id: 1,
//             name: 1,
//             user_profile: 1,
//             user_name: "$users.name",
//             profile: "$users.profile",
//           },
//         },
//       ])
//       .skip(Number(limit) * page)
//       .limit(Number(limit))
//       .sort({ _id: -1 })
//       .exec();

//     if (result.length > 0) {
//       var response = {
//         status: 200,
//         message: "Success.",
//         data: result,
//         base_url: process.env.BASEURL,
//       };
//       return res.status(200).send(response);
//     } else {
//       var response = {
//         status: 201,
//         message: "Failed.",
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
    if (req.files && req.files.user_profile) {
      const localFilePath = path.join(
        "public/assets/review",
        req.files.user_profile[0].filename
      );
      console.log("🚀 ~ createReview ~ localFilePath:", localFilePath);
      const bucketFilePath = `reviews/${req.files.user_profile[0].filename}`;

      try {
        // Upload to S3
        imagePath = await s3UploadImage(localFilePath, bucketFilePath);
        console.log("🚀 ~ createReview ~ imagePath:", imagePath);

        // If upload is successful, delete the local file
        fs.unlinkSync(localFilePath);
      } catch (s3Error) {
        // On S3 upload failure, still delete the local file
        fs.unlinkSync(localFilePath);
        return res.status(500).json({
          message: "Error uploading image to S3",
          error: s3Error.message,
        });
      }
    }
    const newreview = await reviewModal.findByIdAndUpdate(id, {
      name,
      review,
      rating,
    });
    if (newreview) {
      const response = {
        status: 200,
        message: "Success.",
        data: newreview,
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
    console.log("🚀 ~ updateReview ~ error:", error);
    const responce = {
      status: 501,
      message: "Internal Server Error",
    };
    return res.status(501).send(responce);
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
