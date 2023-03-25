import mongoose, {mongo} from "mongoose";

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    gender: {
      type: String,
      required: true,
      enum: ["male", "female"],
    },
    phone_number: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ["active", "inactive"],
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      minLength: 4,
    },
    resetLink: {
      type: String,
      default: "",
    },
    notifications: [
      {
        drug_id: {type: mongoose.Schema.Types.ObjectId, required: true, ref: "drug"},
        message: String,
        read: {type: Boolean, default: false},
        createdAt: {type: Date, default: Date.now},
      },
    ],
  },
  {
    timestamps: true,
  }
);

const user = mongoose.model("user", userSchema);

export default user;
