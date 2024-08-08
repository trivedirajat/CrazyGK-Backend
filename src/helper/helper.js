var express = require("express");
var jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const saltRound = 10;
const salt = bcrypt.genSaltSync(saltRound);
const fs = require("fs");
const path = require("path");
const AWS = require("aws-sdk");
function hashPassword(password) {
  return bcrypt.hash(password, salt);
}
const comparePassword = (hashedPassword, password) => {
  return bcrypt.compareSync(password, hashedPassword);
};

async function jwtToken(user_id, name, email, user_type, type) {
  const token = jwt.sign(
    {
      user_id: user_id,
      name: name,
      email: email,
      user_type: user_type,
      type: type,
    },
    process.env.JWTKEY,
    { expiresIn: "365d" }
  );
  return token;
}

async function newThemeUpdate(theme_url, path_name, data) {
  // Function to recursively copy a folder
  const copyFolder = (source, destination) => {
    // Create destination folder if it doesn't exist
    if (!fs.existsSync(destination)) {
      fs.mkdirSync(destination);
    }

    // Get the list of files and directories in the source folder
    const files = fs.readdirSync(source);
    // const sourcePathnew = path.join(source, "jsonformatter.js");
    const sourcePathnew = path.join(source, "jsonData.json");

    // Iterate through each file/directory
    files.forEach((file) => {
      const sourcePath = path.join(source, file);
      const destinationPath = path.join(destination, file);

      // Check if it's a directory
      if (fs.lstatSync(sourcePath).isDirectory()) {
        // Recursively copy subfolder
        copyFolder(sourcePath, destinationPath);
      } else {
        // It's a file, copy and modify if it's a JavaScript file
        if (path.basename(sourcePath) === path.basename(sourcePathnew)) {
          // Read the file contents
          // const fileContents = fs.readFileSync(sourcePath, 'utf8');
          // console.log('fileContents: ', fileContents);

          // Modify the file contents as needed
          // const modifiedContents = fileContents.replace('address', 'newValue');

          // Write the modified contents to the destination file
          // fs.writeFileSync(destinationPath, "modifiedContents", 'utf8');
          // fs.writeFileSync(destinationPath, JSON.stringify(result[0].orderdetails), 'utf8');
          fs.writeFileSync(destinationPath, JSON.stringify(data), "utf8");
          // console.log('path.extname(sourcePath): ', path.extname(sourcePath));
        } else {
          // It's not a JavaScript file, simply copy it to the destination
          fs.copyFileSync(sourcePath, destinationPath);
        }
      }
    });
  };
  const sourceFolder = theme_url;
  const destinationFolder = path_name;

  await copyFolder(sourceFolder, destinationFolder);

  return true;
}
const fileRemovePath = (filePath) => {
  return fs.rmSync(filePath, { recursive: true });

  // fs.exists(filePath, function (exitfi) {
  //     if (exitfi) {
  //         return fs.unlinkSync(filePath);
  //     }else{
  //         return false
  //     }
  // });
};
function isJSONStringify(text) {
  if (typeof text !== "string") {
    return false;
  }
  try {
    var json = JSON.parse(text);
    return typeof json === "object";
  } catch (error) {
    return false;
  }
}

const isValidUrl = (urlString) => {
  const img = urlString.split("/");
  if (img[0] != "https:" && img[0] != "http:") {
    return false;
  } else {
    return true;
  }

  // var urlPattern = new RegExp('^(https?:\\/\\/)?' + // validate protocol
  //     '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // validate domain name
  //     '((\\d{1,3}\\.){3}\\d{1,3}))' + // validate OR ip (v4) address
  //     '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // validate port and path
  //     '(\\?[;&a-z\\d%_.~+=-]*)?' + // validate query string
  //     '(\\#[-a-z\\d_]*)?$', 'i'); // validate fragment locator
  // return !!urlPattern.test(urlString);
};
const s3UploadImage = async (localFilePath, bucketFilePath) => {
  const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
    region: process.env.AWS_REGION,
  });

  const paramstm = {
    Bucket: process.env.BUCKETNAME,
    Key: bucketFilePath,
    Body: fs.readFileSync(localFilePath),
    ContentType: "image/jpeg",
  };

  await s3.upload(paramstm, (err, data) => {
    if (err) {
      console.error("Error uploading image to S3:", err);
      return false;
    } else {
      console.log("Successfully uploaded image to S3");
      if (data?.Key != undefined) {
        fileRemovePath(`${localFilePath}`);
      }
      return true;
    }
  });
};
module.exports = {
  jwtToken,
  hashPassword,
  comparePassword,
  newThemeUpdate,
  fileRemovePath,
  isJSONStringify,
  isValidUrl,
  s3UploadImage,
};
