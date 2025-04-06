const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  phone: String,
  location: String,
  about: {
    type: String,
    required: true
  },
  skills: [{
    name: String,
    level: Number
  }],
  experience: [{
    title: String,
    company: String,
    location: String,
    from: Date,
    to: Date,
    current: Boolean,
    description: String
  }],
  education: [{
    school: String,
    degree: String,
    field: String,
    from: Date,
    to: Date,
    description: String
  }],
  social: {
    linkedin: String,
    github: String,
    twitter: String
  }
});

module.exports = mongoose.model('Profile', ProfileSchema); 