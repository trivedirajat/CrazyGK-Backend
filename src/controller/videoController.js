const { isValidObjectId } = require("../helper/helper");
const videoModal = require("../models/videoModal");


async function addVideo(req, res) {
  const { title, description, subject_id, video_url, status, is_trending } =
    req.body;

  // Validate required fields
  if (!title || !video_url || !subject_id) {
    return res.status(400).json({
      status: 400,
      message: "Title, subject_id, and video_url are required fields.",
    });
  }

  try {
    const newVideo = new videoModal({
      title,
      description: description || [],
      subject_id,
      video_url,
      status,
      is_trending,
    });

    const savedVideo = await newVideo.save();
    return res.status(201).json({
      status: 201,
      message: "Video added successfully",
      data: savedVideo,
    });
  } catch (error) {
    console.error("Error:", error.message);
    return res.status(500).json({
      status: 500,
      message: "Internal Server Error",
    });
  }
}

async function getvideo(req, res) {
  try {
    const { limit = 10, offset = 0, title = "", subject_id } = req.query;
    const page = Math.max(0, Number(offset));
    const perPage = Math.max(1, Number(limit));

    let query = {};
    if (title.trim()) {
      query.title = { $regex: new RegExp(title, "i") };
    }
    if (subject_id && isValidObjectId(subject_id)) {
      query.subject_id = subject_id;
    }

    const result = await videoModal
      .find(query)
      .select({ description: 0 })
      .skip(perPage * page)
      .limit(perPage)
      .sort({ createdDate: "desc" })
      .populate({
        path: "subject_id",
        select: "_id subject_name",
      })
      .exec();

    const total = await videoModal.countDocuments(query);
    const totalTrendingVideos = await videoModal.countDocuments({
      is_trending: true,
    });
    if (result.length > 0) {
      return res.status(200).json({
        status: 200,
        message: "Success",
        data: result,
        total_data: total,
        current_page: page,
        per_page: perPage,
        total_pages: Math.ceil(total / perPage),
        totalTrendingVideos,
      });
    } else {
      return res.status(404).json({
        status: 404,
        message: "No videos found.",
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
async function getVideoById(req, res) {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({
      status: 400,
      message: "Invalid video ID.",
    });
  }

  try {
    const video = await videoModal.findById(id);

    if (!video) {
      return res.status(404).json({
        status: 404,
        message: "Video not found",
      });
    }

    return res.status(200).json({
      status: 200,
      message: "Success",
      data: video,
    });
  } catch (error) {
    console.error("Error:", error.message);
    return res.status(500).json({
      status: 500,
      message: "Internal Server Error",
    });
  }
}
async function editVideo(req, res) {
  const { id } = req.params;
  const { title, description, subject_id, video_url, status, is_trending } =
    req.body;

  if (!isValidObjectId(id)) {
    return res.status(400).json({
      status: 400,
      message: "Invalid video ID.",
    });
  }

  try {
    const updatedVideo = await videoModal.findByIdAndUpdate(
      id,
      {
        title,
        description: description || [],
        subject_id,
        video_url,
        status,
        is_trending,
      },
      { new: true }
    );

    if (!updatedVideo) {
      return res.status(404).json({
        status: 404,
        message: "Video not found",
      });
    }

    return res.status(200).json({
      status: 200,
      message: "Video updated successfully",
      data: updatedVideo,
    });
  } catch (error) {
    console.error("Error:", error.message);
    return res.status(500).json({
      status: 500,
      message: "Internal Server Error",
    });
  }
}
async function videoDelete(req, res) {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({
      status: 400,
      message: "Invalid video ID.",
    });
  }

  try {
    const deletedVideo = await videoModal.findByIdAndDelete(id);

    if (!deletedVideo) {
      return res.status(404).json({
        status: 404,
        message: "Video not found",
      });
    }

    return res.status(200).json({
      status: 200,
      message: "Video deleted successfully",
    });
  } catch (error) {
    console.error("Error:", error.message);
    return res.status(500).json({
      status: 500,
      message: "Internal Server Error",
    });
  }
}

module.exports = { addVideo, getvideo, videoDelete, getVideoById, editVideo };
