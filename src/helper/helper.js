const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const fs = require("fs");
const path = require("path");
const AWS = require("aws-sdk");
const cheerio = require("cheerio");
const saltRounds = 10;
const { ObjectId } = require("mongodb");

function isValidObjectId(id) {
  return ObjectId.isValid(id);
}
function filterValidIds(input) {
  if (Array.isArray(input)) {
    return input.map((id) => ({
      id,
      valid: isValidObjectId(id),
    }));
  } else if (typeof input === "string") {
    return [
      {
        id: input,
        valid: isValidObjectId(input),
      },
    ];
  } else {
    return [];
  }
}
// Asynchronous function to hash a password
async function hashPassword(password) {
  try {
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
  } catch (error) {
    throw new Error("Error hashing password: " + error.message);
  }
}

async function comparePassword(hashedPassword, password) {
  try {
    const isMatch = await bcrypt.compare(password, hashedPassword);
    return isMatch;
  } catch (error) {
    throw new Error("Error comparing password: " + error.message);
  }
}
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
const uploadAndSaveImage = async (req, fileFieldName, folderPath) => {
  try {
    const imageFile =
      req.files && req.files[fileFieldName]
        ? req.files[fileFieldName][0]
        : null;

    if (!imageFile) {
      return { success: false, message: "No image file provided" };
    }

    // Save image locally
    const localFilePath = path.join(folderPath, imageFile.filename);
    req.body.image = imageFile.filename;

    const bucketFilePath = `${fileFieldName}/${imageFile.filename}`;

    try {
      const s3Result = await s3UploadImage(localFilePath, bucketFilePath);
      if (s3Result) {
        fs.unlink(localFilePath, (err) => {
          if (err)
            console.log(`Failed to delete local file: ${localFilePath}`, err);
        });
        return { success: true, imageUrl: s3Result.Location };
      }
    } catch (s3Error) {
      console.log("S3 upload failed:", s3Error);
    }

    return {
      success: true,
      imageUrl: `${process.env.SITEURL}/${folderPath}/${imageFile.filename}`,
    };
  } catch (error) {
    console.error("Image upload failed:", error.message);
    return { success: false, message: "Internal server error" };
  }
};
const generateAccessToken = (user) => {
  return jwt.sign(
    { _id: user._id, user_type: user.user_type },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: "15m" }
  );
};

// Generate Refresh Token
const generateRefreshToken = (user) => {
  return jwt.sign({ _id: user._id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "7d",
  });
};

// Verify JWT Token
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_ACCESS_SECRET);
  } catch (err) {
    return null;
  }
};

// Verify Refresh Token
const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch (err) {
    return null;
  }
};
const isAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied: Admins only" });
  }
  next();
};

const isUser = (req, res, next) => {
  if (req.user.role !== "user") {
    return res.status(403).json({ message: "Access denied: Users only" });
  }
  next();
};

function generateTOCFromHtml(htmlContent) {
  if (!htmlContent || typeof htmlContent !== "string") {
    return [];
  }

  const $ = cheerio.load(htmlContent);
  const headings = $("h1, h2, h3, h4, h5");

  const toc = [];
  headings.each((index, element) => {
    const level = element.tagName.toLowerCase();
    const text = $(element).text();
    const id = text.toLowerCase().replace(/\s+/g, "-"); 

    toc.push({ text, id, level });
  });

  return toc;
}

module.exports = {
  jwtToken,
  hashPassword,
  comparePassword,
  newThemeUpdate,
  fileRemovePath,
  isJSONStringify,
  isValidUrl,
  s3UploadImage,
  uploadAndSaveImage,
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
  verifyRefreshToken,
  isAdmin,
  isUser,
  isValidObjectId,
  filterValidIds,
  generateTOCFromHtml,
};
