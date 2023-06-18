const express = require("express");
const userRouter = express.Router();
const User = require("../../models/User");
const jwt = require("jsonwebtoken");
const passport = require("passport");

const validateRegisterInput = require("../../user-validation/register");
const validateLoginInput = require("../../user-validation/login");

const {
  getToken,
  COOKIE_OPTIONS,
  getRefreshToken,
  verifyUser
 } = require("../../authenticate");

// @route POST api/users/register
// @desc Register user
// @access Public
userRouter.post("/register", async (req, res, next) => {
  const { errors, isValid } = validateRegisterInput(req.body);

  if (!isValid) {
    res.statusCode = 400;
    res.send({
      name: "Errors",
      message: "There are errors",
      errors
    });
  } else {
    User.register(
      new User({
        username: req.body.email,
        firstName: req.body.firstName,
        lastName: req.body.lastName
      }),
      req.body.password,
      async (err, user) => {
        try {
          if (err) {
            res.statusCode = 500;
            res.send(err);
          } else {
            const token = getToken({ _id: user._id });
            const refreshToken = getRefreshToken({ _id: user._id });
            user.refreshToken.push({ refreshToken });
            await user.save();
            res.cookie("refrehToken", refreshToken, COOKIE_OPTIONS);
            res.send({ success: true, token });
          }
        } catch (err) {
          res.statusCode = 500;
          res.send(err);
        }
      }
    );
  }
});

// @route POST api/users/login
// @desc Login user and return JWT token
// @access Public
userRouter.post("/login", passport.authenticate("local"), async (req, res, next) => {
  const { errors, isValid } = validateLoginInput(req.body);

  if (!isValid) {
    res.status(400).json(errors);
    for (const error in errors) {
      console.log(error);
    }
  }

  const token = getToken({ _id: req.user._id });
  const refreshToken = getRefreshToken({ _id: req.user._id });
  try {
    const user = await User.findById(req.user._id);
    user.refreshToken.push({ refreshToken });
    try {
      await user.save();
      res.cookie("refreshToken", refreshToken, COOKIE_OPTIONS);
      res.send({ success: true, token });
    } catch (err) {
      res.statusCode = 500;
      res.send(err);
    }
  } catch (err) {
    return next(err);
  }
});

// @route POST api/users/refreshToken
// @desc Refresh JWT and allow user to access protected routes
// @access Public
userRouter.post("/refreshToken", async (req, res, next) => {
  console.log(`/refreshToken route, req.cookies: ${req.cookies}`);
  const { signedCookies = {} } = req;
  const { refreshToken } = signedCookies;
  if (refreshToken) {
    try {
      const payload = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
      const userId = payload._id;
      const user = await User.findOne({ _id: userId });
      if (user) {
        // Find the refresh token against the user record in database
        const tokenIndex = user.refreshToken.findIndex(
          item => item.refreshToken === refreshToken
        );

        if (tokenIndex === -1) {
          res.statusCode = 401;
          res.send("Unauthorized");
        } else {
          const token = getToken({ _id: userId });

          // If the refresh token exists, then create new one and replace it.
          const newRefreshToken = getRefreshToken({ _id: userId });
          user.refreshToken[tokenIndex] = { refreshToken: newRefreshToken };
          try {
            await user.save();
            res.cookie("refreshToken", refreshToken, COOKIE_OPTIONS);
            res.send({ success: true, token });
          } catch (err) {
            res.statusCode = 500;
            res.send(err);
          }
        }
      } else {
        res.statusCode = 401;
        res.send("Unauthorized");
      }
    } catch (err) {
      res.statusCode = 401;
      res.send("Unauthorized");
      return next(err);
    }
  } else {
    res.statusCode = 401;
    res.send("Unauthorized");
  }
});

// @route GET api/users/user-info
// @desc Send user details
// @access Public
userRouter.get("/user-info/", verifyUser, (req, res, next) => {
  res.send({ user: req.user, isLoggedIn: true });
});

// @route GET api/users/logout
// @desc Log user out
// @access Public
userRouter.get("/logout", verifyUser, async (req, res, next) => {
  console.log(`/logout route, req.cookies: ${req.cookies}`);
  const { signedCookies = {} } = req;
  const { refreshToken } = signedCookies;
  try {
    const user = await User.findById(req.user._id);
    const tokenIndex = user.refreshToken.findIndex(
      item => item.refreshToken === refreshToken
    );

    if (tokenIndex !== -1) {
      user.refreshToken.id(user.refreshToken[tokenIndex]._id).remove();
    }

    try {
      await User.save();
      res.clearCookie("refreshToken", COOKIE_OPTIONS);
      res.send({ success: true });
    } catch (err) {
      res.statusCode = 500;
      res.send(err);
      return next(err);
    }

  } catch (err) {
    res.statusCode = 404;
    res.send(err);
  }
});

module.exports = userRouter;