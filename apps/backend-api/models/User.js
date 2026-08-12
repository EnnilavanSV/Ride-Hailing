const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: [true, "Please add an email"],
      unique: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please add a valid email",
      ],
    },
    password: {
      type: String,
      required: [true, "Please add a password"],
      minlength: 6,
    },
    phone: {
      type: String,
      required: [true, "Please add a phone number"],
    },
    isAdmin: { type: Boolean, required: true, default: false },
    savedAddresses: [
      {
        title: {
          type: String,
          required: true,
          // e.g., 'Home', 'Work', 'Other'
        },
        address: {
          type: String,
          required: true,
        },
      },
    ],
  },

  {
    timestamps: true,
  },
);

userSchema.pre("save", async function () {
  // If the password hasn't been changed, move on (useful for user updates later)
  if (!this.isModified("password")) {
    return;
  }

  // Generate a "salt" (random data) and hash the password
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

//Method to compare incoming password with the hashed password in the database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
