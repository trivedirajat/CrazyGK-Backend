const jobModal = require("../models/jobModal");
const { ObjectId } = require("mongodb");

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
  try {
    const { JobId, title, apply_date, job_link } = req.body;
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
    const { limit = 400, offset = 0, search_title } = req.body;
    const page = Math.max(0, Number(offset));

    const query = search_title
      ? { title: { $regex: new RegExp(search_title, "ig") } }
      : {};

    const jobs = await jobModal
      .find(query)
      .sort({ _id: -1 })
      .skip(Number(limit) * page)
      .limit(Number(limit))
      .exec();

    const total = await jobModal.countDocuments(query);

    const response = {
      status: 200,
      message: "Success.",
      data: jobs,
      total_data: total,
    };

    return res.status(response.status).send(response);
  } catch (error) {
    console.error("Error fetching jobs:", error.message);
    return res
      .status(500)
      .send({ status: 500, message: "Internal Server Error" });
  }
}

async function deleteJob(req, res) {
  try {
    // const user_id = req.user_id
    // if(user_id === undefined || user_id === ''){
    //     var responce = {
    //         status: 403,
    //         message: 'User not authorised.',
    //     }
    //     return res.status(403).send(responce);
    // }
    const { job_id } = req.body;

    const result = await jobModal.deleteOne({ _id: new ObjectId(job_id) });
    var response = {
      status: 200,
      message: "Success.",
    };
    return res.status(200).send(response);
  } catch (error) {
    console.log("error", error.message);
    var responce = {
      status: 501,
      message: "Internal Server Error",
    };
    return res.status(501).send(responce);
  }
}

module.exports = { addJob, getJob, deleteJob, UpdateJobs };
