const mongoose = require("mongoose");
const { BookSchema } = require("./Book");
const passportLocalMongoose = require("passport-local-mongoose");

const Schema = mongoose.Schema;

const SessionSchema = new Schema({
  refreshToken: {
    type: String,
    default: ""
  }
});

const UserSchema = new Schema({
  firstName: {
    type: String,
    required: true,
    default: ""
  },
  lastName: {
    type: String,
    required: true,
    default: ""
  },
  authStrategy: {
    type: String,
    required: true,
    default: "local"
  },
  books: {
    type: [BookSchema],
    required: true,
    default: []
  },
  refreshToken: {
    type: [SessionSchema]
  },
  date: {
    type: Date,
    default: Date.now
  }
});

// Remove refreshToken from the response
UserSchema.set("toJSON", {
  transform: (doc, ret, options) => {
    delete ret.refreshToken;
    return ret;
  }
});

UserSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User", UserSchema);

module.exports = User;