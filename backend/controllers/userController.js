import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

import User from "../models/userModel.js";
import generateToken from "../util/generateToken.js";

const loginUser = async (req, res, next) => {
  try {
    const {email, password} = req.body;
    const user = await User.findOne({email});

    if (user && (await bcrypt.compare(password, user.password))) {
      return res.status(200).json({
        _id: user._id,
        status: user.status,
        isAdmin: user.isAdmin,
        token: generateToken(user._id, user.name, user.email, user.isAdmin),
      });
    } else {
      res.status(400);
      throw new Error("Invalid credentials");
    }
  } catch (error) {
    next(error);
  }
};

const registerUser = async (req, res, next) => {
  try {
    //Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    const user = await User.create({
      ...req.body,
      password: hashedPassword,
    });

    if (user) {
      const token = generateToken(user._id, user.name, user.email, user.isAdmin);
      return res.status(201).json({...user.toObject(), token});
    } else {
      res.status(400);
      throw new Error("Invalid data");
    }
  } catch (error) {
    next(error);
  }
};

//Admin
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({}).select("-password");
    return res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

const getProfile = async (req, res, next) => {
  try {
    if (!req.user.id) {
      return res.status(404).json({message: "User not found"});
    }

    const user = await User.findById(req.user.id).select("-password");
    if (user) {
      res.status(200).json({
        name: user.name,
        phone_number: user.phone_number,
        gender: user.gender,
        email: user.email,
      });
    } else {
      res.status(404);
      throw new Error("User not found");
    }
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    if (!req.user.id) {
      return res.status(404).json({message: "User fot found"});
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({message: "User not found"});
    } else {
      let filter = {_id: req.user.id};
      if (req.body.password) {
        //Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);
        req.body.password = hashedPassword;
      }

      let updatedUser = await User.findOneAndUpdate(filter, req.body, {
        new: true,
        runValidators: true,
      }).select("-password");

      return res.status(201).json({
        ...updatedUser.toObject(),
        token: generateToken(user._id, user.name, user.email, user.isAdmin),
      });
    }
  } catch (error) {
    next(error);
  }
};

//Admin
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      await user.remove();
      return res.status(200).json({message: `User ${req.params.id} removed`});
    } else {
      res.status(404);
      throw new Error("User not found");
    }
  } catch (error) {
    next(error);
  }
};

//Admin
const updateUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({message: "User Not Found"});
    } else {
      let filter = {_id: req.params.id};

      if (req.body.password) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);
        req.body.password = hashedPassword;
      }

      let updatedUser = await User.findOneAndUpdate(filter, req.body, {
        new: true,
        runValidators: true,
      }).select("-password");

      return res.status(201).json(updatedUser);
    }
  } catch (error) {
    next(error);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const {email} = req.body;
    const user = await User.findOne({email});
    if (user) {
      const token = jwt.sign({_id: user._id}, process.env.JWT_SECRET, {expiresIn: "20m"});

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL,
          pass: process.env.PASSWORD,
        },
      });

      const mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: "Benet pharmacy account activation link",
        html: `
          <p> 
          Hi ${user.name},
          
          You recently requested to reset the password for your pharmacy account.<br> 
          Click the button below to proceed.
          
          <div style = "
             margin-top: 50px;
             margin-bottom: 50px; 
             " > 
            <p> 
            <a href="${process.env.CLIENT_URL}/login/${token}" 
            style = " 
            border-radius: 5px;
            text-align: center;
            padding: 10px; 
            font-size: 25px;
            border: none;
            color: aliceblue;
            background-color: #008CBA;
            cursor: grab; 
            text-decoration:none; ">
                Reset your password   
            </a> 
            </p>
          </div>
          
          If you did not request a password reset, please ignore this email.  <br>
          This password reset link is only valid for the next 20 minutes.
          
          <br> Thanks, 
          </p>
        `,
      };

      user.resetLink = token;
      await user.save();

      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          return res.status(400).json({message: error.message});
        } else {
          return res
            .status(201)
            .json({message: "Email has been sent , kindly activate your account"});
        }
      });
    } else {
      res.status(404);
      throw new Error("User not found");
    }
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const {resetLink, newPassword} = req.body;

    if (!resetLink || !newPassword) {
      res.status(400);
      throw new Error("Invalid data");
    } else {
      const decoded = jwt.verify(resetLink, process.env.JWT_SECRET);
      if (decoded) {
        const user = await User.findOne({resetLink});
        if (user) {
          const salt = await bcrypt.genSalt(10);
          const hashedPassword = await bcrypt.hash(newPassword, salt);
          user.password = hashedPassword;
          user.resetLink = "";
          const updatedUser = await user.save();

          return res.status(201).json({
            _id: updatedUser._id,
            token: generateToken(user._id, user.name, user.email, user.isAdmin),
          });
        } else {
          res.status(400);
          throw new Error("Invalid link");
        }
      } else {
        res.status(400);
        throw new Error("Invalid link");
      }
    }
  } catch (error) {
    next(error);
  }
};

const checkLink = async (req, res, next) => {
  try {
    const {resetLink} = req.body;
    const user = await User.findOne({resetLink});
    if (user) {
      return res.status(200).json(user);
    } else {
      res.status(400);
      throw new Error("Invalid link");
    }
  } catch (error) {
    next(error);
  }
};

export {
  loginUser,
  registerUser,
  getProfile,
  getAllUsers,
  updateProfile,
  updateUser,
  deleteUser,
  forgotPassword,
  resetPassword,
  checkLink,
};
