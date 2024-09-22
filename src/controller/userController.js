let user = require("../models/user");
let { ObjectId } = require("mongodb");
const { jwtToken } = require("../helper/helper");

async function getUserList(req, res) {
  try {
    const user_id = req.user_id;
    // if(user_id != undefined || user_id != ''){
    //     var responce = {
    //         status: 403,
    //         message: 'User not authorised.',
    //     }
    //     return res.status(403).send(responce);
    // }

    const { user_name, limit = 30, offset = 0 } = req.body;
    const page = Math.max(0, Number(offset));
    let query = { user_type: "user" };
    if (user_name != undefined && user_name != "") {
      query.user_name = { $regex: new RegExp(user_name, "ig") };
    }
    const result = await user
      .find(query)
      .skip(Number(limit) * page)
      .limit(Number(limit))
      .sort({ createdDate: "desc" })
      .exec();
    if (result.length > 0) {
      const total = await user.find(query).count();

      var response = {
        status: 200,
        message: "Success.",
        data: result,
        total_data: total,
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
const getAllUsers = async (req, res) => {
  try {
    const { limit = 10, page = 1, user_type = "user", user_id } = req.query;
    
    const perPage = Math.max(1, Number(limit)); 
    const currentPage = Math.max(1, Number(page)) - 1; 

    let query = { user_type };  

    if (user_id) {
      query._id = user_id;
    }

    
    const users = await user
      .find(query)
      .skip(perPage * currentPage) 
      .limit(perPage) 
      .sort({ name: "asc" })  
      .exec();

 
    const totalUsers = await user.countDocuments(query);
    if (users.length > 0) {
      return res.status(200).json({
        success: true,
        message: "Users fetched successfully",
        data: users,
        total_data: totalUsers,
        current_page: currentPage + 1,  
        per_page: perPage,
        total_pages: Math.ceil(totalUsers / perPage),  
      });
    } else {
      return res.status(404).json({
        success: false,
        message: "No users found",
      });
    }
  } catch (error) {
    console.error("Error fetching users:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};


async function updateUser(req, res) {
  try {
    const user_id = req.user_id;
    if (user_id === undefined || user_id === "") {
      var responce = {
        status: 403,
        message: "User not authorised.",
      };
      return res.status(403).send(responce);
    }
    if (
      req.files &&
      typeof req.files.profile_image != undefined &&
      req.files.profile_image != null
    ) {
      req.body.profile_image = req.files.profile_image[0].filename;
    }
    let chkUser = await user.find({ _id: new ObjectId(user_id) }).exec();
    if (chkUser.length > 0) {
      let updt = await user.updateOne({ _id: new ObjectId(user_id) }, req.body);
      if (updt.acknowledged) {
        let updateUser = await user
          .findOne({ _id: new ObjectId(user_id) })
          .exec();
        if (updateUser.profile_image) {
          updateUser.profile_image =
            process.env.BASEURL +
            process.env.PROFILE +
            updateUser.profile_image;
        }
        const token = await jwtToken(
          updateUser._id,
          updateUser.user_name,
          updateUser.email,
          updateUser.user_type,
          "logged"
        );
        let response = {
          status: 200,
          message: `User update success.`,
          data: { userDetail: updateUser, token: token },
        };
        return res.status(200).send(response);
      } else {
        let response = {
          status: 201,
          message: `User update Failed.`,
        };
        return res.status(201).send(response);
      }
    } else {
      let response = {
        status: 201,
        message: `User not available.`,
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

const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    const deletedUser = await user.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "An error occurred while deleting the user",
      error: error.message,
    });
  }
};

module.exports = { getUserList, updateUser, getAllUsers, deleteUser };
