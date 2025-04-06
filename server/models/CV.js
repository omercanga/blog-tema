const mongoose = require('mongoose');

const CVSchema = new mongoose.Schema({
  personalInfo: {
    name: String,
    title: String,
    email: String,
    phone: String,
    location: String,
    summary: String,
    socialLinks: [{
      platform: String,
      url: String
    }]
  },
  experience: [{
    title: String,
    company: String,
    location: String,
    startDate: Date,
    endDate: Date,
    current: Boolean,
    description: String,
    achievements: [String]
  }],
  education: [{
    degree: String,
    school: String,
    field: String,
    startDate: Date,
    endDate: Date,
    description: String
  }],
  skills: [{
    category: String,
    items: [String]
  }],
  projects: [{
    title: String,
    description: String,
    technologies: [String],
    link: String
  }],
  languages: [{
    name: String,
    level: String
  }],
  certifications: [{
    name: String,
    issuer: String,
    date: Date,
    link: String
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('CV', CVSchema); 