// const express = require("Express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const Volunteer = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
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
  skills: [
    {
      type: String,
    },
  ],
  hours: {
    type: Number,
  },
  payout: {
    type: String,
  },
  password: {
    type: String,
    required: true,
    minLength: 7,
    trim: true,
  },
  token: {
    type: String,
    // required: true,
  },
});

Volunteer.pre("save", async function (next) {
  const user = this;
  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});

Volunteer.methods.generateAuthToken = async function () {
  const user = this;
  const token = jwt.sign(user._id.toString(), "cezisbest");
  user.token = token;
  await user.save();

  return token;
};

Volunteer.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({ email });
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

const User = mongoose.model("Volunteer", Volunteer);

module.exports = User;
