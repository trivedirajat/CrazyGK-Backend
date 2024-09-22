const { isValidObjectId } = require("../helper/helper");
const jobModal = require("../models/jobModal");

async function addJob(req, res) {
  try {
    const { title, apply_date, job_link } = req.body;

    const requiredFields = { title, apply_date, job_link };
    const missingFields = Object.keys(requiredFields).filter(
      (key) => !requiredFields[key]
    );

    if (missingFields.length > 0) {
      return res.status(400).send({
        status: 400,
        message: `Missing required fields: ${missingFields.join(", ")}`,
      });
    }

    const result = await jobModal.create(req.body);

    if (result) {
      return res.status(200).send({
        status: 200,
        message: "Job added successfully",
        data: result,
        base_url: `${process.env.BASEURL}/${process.env.BLOG}`,
      });
    } else {
      return res.status(500).send({
        status: 500,
        message: "Failed to add job.",
      });
    }
  } catch (error) {
    console.log("error", error.message);
    return res.status(500).send({
      status: 500,
      message: "Internal Server Error",
    });
  }
}
async function UpdateJobs(req, res) {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({
      status: 400,
      message: "Invalid job ID.",
    });
  }
  try {
    const JobId = id;
    const { title, apply_date } = req.body;
    const requiredFields = { JobId, title, apply_date };
    const missingFields = Object.keys(requiredFields).filter(
      (key) => !requiredFields[key]
    );
    if (missingFields.length > 0) {
      return res.status(400).send({
        status: 400,
        message: `Missing required fields: ${missingFields.join(", ")}`,
      });
    }
    const result = await jobModal.findByIdAndUpdate(JobId, req.body);

    if (result) {
      return res.status(200).send({
        status: 200,
        message: "Job updated successfully",
        data: result,
        base_url: `${process.env.BASEURL}/${process.env.BLOG}`,
      });
    } else {
      return res.status(500).send({
        status: 500,
        message: "Failed to update job.",
      });
    }
  } catch (error) {
    console.log("error", error.message);
    return res.status(500).send({
      status: 500,
      message: "Internal Server Error",
    });
  }
}
async function getJob(req, res) {
  try {
    const { limit = 400, offset = 0, search_title } = req.query;
    const page = Math.max(0, Number(offset));
    const perPage = Math.max(1, Number(limit));

    const query = search_title
      ? { title: { $regex: new RegExp(search_title, "i") } }
      : {};

    const jobs = await jobModal
      .find(query)
      .sort({ _id: -1 })
      .skip(perPage * page)
      .limit(perPage)
      .exec();

    const total = await jobModal.countDocuments(query);

    if (jobs.length > 0) {
      return res.status(200).json({
        status: 200,
        message: "Success.",
        data: jobs,
        total_data: total,
        current_page: page,
        per_page: perPage,
        total_pages: Math.ceil(total / perPage),
      });
    } else {
      return res.status(404).json({
        status: 404,
        message: "No jobs found.",
      });
    }
  } catch (error) {
    console.error("Error fetching jobs:", error.message);
    return res.status(500).json({
      status: 500,
      message: "Internal Server Error",
    });
  }
}
async function getJobById(req, res) {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({
      status: 400,
      message: "Invalid job ID.",
    });
  }

  try {
    const job = await jobModal.findById(id);

    if (!job) {
      return res.status(404).json({
        status: 404,
        message: "Job not found.",
      });
    }

    return res.status(200).json({
      status: 200,
      message: "Success.",
      data: job,
    });
  } catch (error) {
    console.error("Error:", error.message);
    return res.status(500).json({
      status: 500,
      message: "Internal Server Error",
    });
  }
}
async function deleteJob(req, res) {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({
      status: 400,
      message: "Invalid job ID.",
    });
  }

  try {
    const deletedJob = await jobModal.findByIdAndDelete(id);

    if (!deletedJob) {
      return res.status(404).json({
        status: 404,
        message: "Job not found.",
      });
    }

    return res.status(200).json({
      status: 200,
      message: "Job deleted successfully.",
    });
  } catch (error) {
    console.error("Error:", error.message);
    return res.status(500).json({
      status: 500,
      message: "Internal Server Error",
    });
  }
}

module.exports = { addJob, getJob, deleteJob, UpdateJobs, getJobById };
