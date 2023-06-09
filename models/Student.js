// const express = require("Express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const studentSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,

    unique: true,
    trim: true,
    validate(value) {
      if (!validator.isEmail(value)) {
        throw new Error("Email is invalid");
      }
    },
  },
  mobileNumber: {
    type: Number,
    required: true,
    length: 10,
    // unique: true,
    trim: true,
  },

  password: {
    type: String,
    required: true,
    minLength: 7,
    trim: true,
  },
  subscription: {
    type: String,
  },
  limit: {
    type: Number,
  },
  token: {
    type: String,
    // required: true,
  },
});

studentSchema.pre("save", async function (next) {
  const user = this;
  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});

studentSchema.methods.generateAuthToken = async function () {
  const user = this;
  const token = jwt.sign(user._id.toString(), "cezisbest");
  user.token = token;
  await user.save();

  return token;
};

studentSchema.statics.findByCredentials = async (email, password) => {
  const user = await Student.findOne({ email });
  console.log(user);
  if (!user) {
    throw new Error("Unable to login");
  }
  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error("Unable to login");
  }

  return user;
};

const Student = mongoose.model("Student", studentSchema);

module.exports = Student;
