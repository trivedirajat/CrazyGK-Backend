const currentAffairs = require("../models/currentAffairs");
var { ObjectId } = require("mongodb");
var moment = require("moment");
const { generateTOCFromHtml } = require("../helper/helper");

const addCurrentAffairs = async (req, res) => {
  try {
    const { title, description, status, is_important, date } = req.body;
    const toc = generateTOCFromHtml(description) || [];
    const newAffair = new currentAffairs({
      title,
      description,
      status,
      is_important,
      date,
      toc,
    });

    await newAffair.save();
    return res
      .status(201)
      .json({ message: "Current Affair added successfully", data: newAffair });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to add current affair", error: error.message });
  }
};
const getCurrentAffairs = async (req, res) => {
  const { type, date, topic, offset = 1, limit = 10 } = req.query;
  const page = Math.max(0, Number(offset) - 1); // Pages should start from 0 for pagination
  const perPage = Math.max(1, Number(limit));

  try {
    const query = {};
    let total;

    // Ensure the date is valid
    if (date && !moment(date, "YYYY-MM-DD", true).isValid()) {
      return res.status(400).json({
        message: "Invalid date format. Use YYYY-MM-DD format.",
      });
    }

    // Construct the query based on the parameters
    if (type === "daily" && date) {
      // Convert the date into a full-day range (startOf and endOf ensure full coverage of the day)
      query.date = {
        $gte: moment(date, "YYYY-MM-DD").startOf("day").toDate(), // start of the day
        $lt: moment(date, "YYYY-MM-DD").endOf("day").toDate(), // end of the day
      };
    } else if (type === "monthly" && date) {
      // Monthly type filter
      const startOfMonth = moment(date, "YYYY-MM-DD").startOf("month").toDate();
      const endOfMonth = moment(date, "YYYY-MM-DD").endOf("month").toDate();
      query.date = { $gte: startOfMonth, $lt: endOfMonth };
    } else if (type === "editorial") {
      // Filter for important current affairs
      query.is_important = true;
    } else if (topic) {
      // Filter based on topic
      query.topic = topic;
    }

    // If no query parameters are provided, return all current affairs
    total = await currentAffairs.countDocuments(query);

    const affairs = await currentAffairs
      .find(query)
      .sort({ createdDate: "desc" })
      .skip(perPage * page)
      .limit(perPage);

    return res.status(200).json({
      data: affairs,
      total_data: total,
      current_page: page + 1, // Adjust for zero-based page index
      per_page: perPage,
      total_pages: Math.ceil(total / perPage),
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error fetching current affairs",
      error: error.message,
    });
  }
};
const getCurrentAffairsById = async (req, res) => {
  const { id } = req.params;

  try {
    const currentAffair = await currentAffairs.findById(id);

    if (!currentAffair) {
      return res.status(404).json({ message: "Current affairs not found" });
    }

    return res.status(200).json({ data: currentAffair });
  } catch (error) {
    return res.status(500).json({
      message: "Error fetching current affairs",
      error: error.message,
    });
  }
};
async function getCurrentAffairss(req, res) {
  try {
    // const user_id = req.user_id
    // if(user_id === undefined || user_id === ''){
    //     var responce = {
    //         status: 403,
    //         message: 'User not authorised.',
    //     }
    //     return res.status(403).send(responce);
    // }
    const {
      limit = 400,
      offset = 0,
      subject_id,
      data_type,
      select_date,
      current_date,
      search_title,
    } = req.body; // 1=Daily, 2=Monthly, 3=Topic Wise, Editorial
    const startOfMonth = moment(current_date)
      .startOf("month")
      .format("DD-MM-YYYY");
    const endOfMonth = moment(current_date).endOf("month").format("DD-MM-YYYY");

    const page = Math.max(0, Number(offset));
    let query = {};
    if (subject_id != undefined && subject_id != "") {
      query.subject_id = new ObjectId(subject_id);
    }
    if (search_title != undefined && search_title != "") {
      query.title = { $regex: new RegExp(search_title, "ig") };
    }

    if (data_type == 2) {
      //month
      query.date = { $gte: startOfMonth, $lt: endOfMonth };
    }

    const subLook = {
      $lookup: {
        from: "subjects",
        localField: "subject_id",
        foreignField: "_id",
        as: "subjects",
      },
    };
    const subUnw = { $unwind: "$subjects" };
    const subProject = {
      $project: {
        _id: 1,
        title: 1,
        description: 1,
        image: 1,
        status: 1,
        createdDate: 1,
        subject_id: 1,
        date: 1,
        subject_name: "$subjects.subject_name",
      },
    };

    const dayWishDalyList = await currentAffairs
      .aggregate([{ $match: query }, subLook, subUnw, subProject])
      .skip(Number(limit) * page)
      .limit(Number(limit))
      .sort({ date: -1 })
      .exec();

    if (data_type == 1 && select_date != undefined && select_date.length > 0) {
      query.date = { $in: JSON.parse(select_date) };
    }
    if (data_type == 2) {
      //month
      query.is_important = true;
    }
    const importantDate = await currentAffairs
      .aggregate([{ $match: query }, subLook, subUnw, subProject])
      .skip(Number(limit) * page)
      .limit(Number(limit))
      .sort({ date: -1 })
      .exec();

    if (importantDate.length > 0 || dayWishDalyList.length > 0) {
      const usrData = {
        day_wish_daly_list: dayWishDalyList,
        important_date: importantDate,
      };

      const total = await currentAffairs.count(search_title);

      var response = {
        status: 200,
        message: "Success.",
        data: usrData,
        total_data: total,
        base_url: process.env.BASEURL,
      };
      return res.status(200).send(response);
    } else {
      var response = {
        status: 201,
        message: "Failed.",
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
async function getAllCurrentAffairs(req, res) {
  try {
    const AllcurrentAffairs = await currentAffairs.find();
    var response = {
      status: 200,
      message: "Success.",
      data: AllcurrentAffairs,
    };
    return res.status(200).send(response);
  } catch (error) {
    console.log("error current affairs", error.message);
    var responce = {
      status: 501,
      message: "Internal Server Error",
    };
    return res.status(501).send(responce);
  }
}
const deleteCurrentAffairs = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedAffair = await currentAffairs.findByIdAndDelete(id);

    if (!deletedAffair) {
      return res.status(404).json({ message: "Current affairs not found" });
    }

    return res.status(200).json({
      message: "Current affairs deleted successfully",
      data: deletedAffair,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error deleting current affairs",
      error: error.message,
    });
  }
};
async function currentAffairsStatusUpdate(req, res) {
  try {
    const user_id = req.user_id;
    if (user_id === undefined || user_id === "") {
      var responce = {
        status: 403,
        message: "User not authorised.",
      };
      return res.status(403).send(responce);
    }
    const { currentAffairs_id, is_important } = req.body;

    const result = await currentAffairs.updateOne(
      { _id: new ObjectId(currentAffairs_id) },
      { is_important: is_important === "true" ? true : false }
    );
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
const editCurrentAffairs = async (req, res) => {
  const { id } = req.params;
  const { title, description, status, is_important, date } = req.body;

  try {
    const currentAffair = await currentAffairs.findById(id);

    if (!currentAffair) {
      return res.status(404).json({ message: "Current affairs not found" });
    }

    currentAffair.title = title ?? currentAffair.title;
    currentAffair.description = description ?? currentAffair.description;
    currentAffair.status = status ?? currentAffair.status;
    currentAffair.is_important = is_important ?? currentAffair.is_important;
    currentAffair.date = date ? new Date(date) : currentAffair.date;

    await currentAffair.save();

    return res.status(200).json({
      message: "Current affairs updated successfully",
      data: currentAffair,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error updating current affairs",
      error: error.message,
    });
  }
};
module.exports = {
  addCurrentAffairs,
  getCurrentAffairs,
  deleteCurrentAffairs,
  currentAffairsStatusUpdate,
  getAllCurrentAffairs,
  getCurrentAffairsById,
  editCurrentAffairs,
};
