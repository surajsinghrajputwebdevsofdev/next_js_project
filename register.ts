import mongoose from "mongoose";
import { PLAN, ROLE } from "../lib/enum";

const RegisterSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      // unique: true,
      // trim: true,
      // lowercase: true,
      validate: {
        validator: (email: string) => {
          const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
          return emailRegex.test(email);
        },
        message: "Invalid email format",
      },
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters long"],
    },
    avatar: {
      type: String,
      default:
        "https://i.pinimg.com/736x/0d/64/98/0d64989794b1a4c9d89bff571d3d5842.jpg",
    },
    labName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      maxLength: [20, "Laboratory name cannot be more than 20 characters"],
    },
    name: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: [true, "Phone number is required"],
      match: [/^\+?\d{8,14}$/, "Invalid phone number format"], // Adjust regex as per your phone number format
    },
    role: {
      type: String,
      enum: Object.values(ROLE),
      default: ROLE.LABORATORY,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    plan: {
      type: String,
      enum: Object.values(PLAN),
      default: PLAN.FREE,
    },
    subDomain: {
      type: String,
      default: "",
    },
    otp: {
        type: String,
        default: "koi otp nhi hai",
    },
  },
  { timestamps: true }
);

const RegisterModel = mongoose.model("Register", RegisterSchema);

export default RegisterModel;
