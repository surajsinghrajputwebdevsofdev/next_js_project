import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import MappingService from "../lib/utils";
import UserModel from "../models/user";
import OTPModel from "../models/otp";
import { userDetail } from "../email-tamplates/userdetail";
import { HTTP_STATUS_CODE } from "../lib/enum";
import RegisterModel from "../models/register";

const register = async (req: Request, res: Response) => {
  const service = new MappingService(res);
  try {
    const { password, ...payload } = req.body;
    const salt = bcrypt.genSaltSync(10);
    const hashPassword = bcrypt.hashSync(password, salt);
    const otp = Math.floor(100000 + Math.random() * 900000);

    Object.assign(payload, {
      password: hashPassword,
      otp: otp,
      /**adding 7 day for free service */
      subscriptionExpiredIn: service.addMinutes(new Date(), 60 * 24 * 7),
    });
    const newUser = new RegisterModel(payload);
    await newUser.save();
    await service.sendMail({
      to: newUser.email,
      subject: "Laboratory details",
      html: userDetail({ data: newUser, password }),
    });
    return service.successResponse({ message: "User registered successfully" });
  } catch (error: any) {
    return service.errorResponse({ error, message: error.message });
  }
};

const login = async (req: Request, resp: Response) => {
  const service = new MappingService(resp);
  try {
    const clientUrl = req.headers["referer"] as string;
    const subDomain = service.getSubDomain(clientUrl);
    const { email, password, labName } = req.body;
    const user = await RegisterModel.findOne({
      $or: [{ email }, { labName: labName || subDomain }],
    });
    const isPasswordMatched = bcrypt.compareSync(
      password,
      user?.password ?? ""
    );
    if (!user || !isPasswordMatched) {
      const errorMessage = `Wrong email/password`;
      return service.errorResponse({
        error: errorMessage,
        status: 404,
        message: errorMessage,
      });
    }
    const token = jwt.sign(
      { _id: user._id },
      String(process.env.JWT_SECRET_KEY)
    );
    return service.successResponse<{ token: string }>({
      token,
      message: "User login successfully",
      userRole: service.encrypt(
        user.role,
        String(process.env.CRYPTO_ENCRYPT_KEY)
      ),
    });
  } catch (error: any) {
    return service.errorResponse({ error: error?.message });
  }
};

const sendOneTimePassword = async (req: Request, resp: Response) => {
  const service = new MappingService(resp);
  try {
    const { email, type, phoneNumber } = req.body;
    const expireIn = 3;
    const otp = service.generateRandomNumbers(100000, 999999);

    if (type === "email") {
      const mailPayload = {
        to: email,
        subject: "OTP",
        text: `Verify your email with this OTP : ${otp}.Otp will expired in ${expireIn} min`,
      };
      await service.sendMail(mailPayload);
    } else if (type === "msg") {
      await service.sendMessage({
        body: `Verify your Phone with this OTP : ${otp}.
                Otp will expired in ${expireIn} min`,
        to: phoneNumber,
        from: process.env.TWILIO_REGISTER_NUMBER,
      });
    }
    const otpPayload: any = {
      otp,
      expiredIn: service.addMinutes(new Date(), expireIn),
    };
    if (email) otpPayload.email = email;
    if (phoneNumber) otpPayload.phoneNumber = phoneNumber;

    await OTPModel.deleteMany({ $or: [{ email }, { phoneNumber }] });
    const newOtp = new OTPModel(otpPayload);
    await newOtp.save();
    return service.successResponse({
      message: `Otp sent successfully on ${email}`,
      status: HTTP_STATUS_CODE.OK,
    });
  } catch (error: any) {
    return service.errorResponse({
      error: error?.message,
      message: error?.message,
    });
  }
};

const isExistingUser = async (req: Request, resp: Response) => {
  const service = new MappingService(resp);
  try {
    const { email } = req.body;
    const exist = await UserModel.findOne({ email });
    if (exist) {
      return service.errorResponse({
        status: HTTP_STATUS_CODE.BAD_REQUEST,
        isExist: !!exist,
        message: "User already exist.Try with another email.",
      });
    }
    return service.successResponse({
      isExist: !!exist,
      message: "User identified successfully.",
    });
  } catch (error: any) {
    return service.errorResponse({ error: error?.message });
  }
};

const findDomain = async (req: Request, resp: Response) => {
  const service = new MappingService(resp);

  try {
    const { email } = req.query;
    const user = await UserModel.findOne({ email });
    if (!user) {
      return service.errorResponse({
        error: "Not found",
        status: HTTP_STATUS_CODE.NOT_FOUND,
        message: "User not found",
      });
    }
    return service.successResponse({
      data: {
        domain: user.subDomain,
      },
      message: "User domain found successfully",
    });
  } catch (error: any) {
    return service.errorResponse({ error: error?.message });
  }
};

const verifyOTP = async (req: Request, res: Response) => {
  const service = new MappingService(res);
  const { email, otp } = req.body;

  try {
    const user = await RegisterModel.findOne({ email });
    if (!user) {
      return service.errorResponse({
        message: "User not found",
        statusCode: HTTP_STATUS_CODE.NOT_FOUND,
      });
    }

    if (user.otp !== otp) {
      return service.errorResponse({
        message: "Invalid OTP",
        statusCode: HTTP_STATUS_CODE.BAD_REQUEST,
      });
    }

    user.isVerified = true;
    user.otp = "null";
    await user.save();

    return service.successResponse({
      message: "OTP verified successfully",
    });
  } catch (error: any) {
    return service.errorResponse({ error, message: error.message });
  }
};

// const verifyOneTimePassword = async (req: Request, resp: Response) => {
//     const service = new MappingService(resp);
//     try {
//         const { otp, email, phoneNumber } = req.body;
//         if (!email && !phoneNumber) return service.errorResponse({ error: "Email or phone Number is required", status: HTTP_STATUS_CODE.BAD_REQUEST, message: "Email or phone Number is required" });
//         const exist = await OTPModel.findOne({ $or: [{ email }, { phoneNumber }] });
//         if (!exist || exist.otp !== otp) {
//             const errorMessage = `OTP is invalid.`;
//             return service.errorResponse({ error: errorMessage, status: HTTP_STATUS_CODE.BAD_REQUEST, message: errorMessage });
//         };
//         if (exist.expiredIn.getTime() < new Date().getTime()) {
//             const errorMessage = `OTP is expired.`;
//             return service.errorResponse({ error: errorMessage, status: HTTP_STATUS_CODE.BAD_REQUEST, message: errorMessage });
//         }
//         exist.expiredIn = new Date();
//         await exist.save();
//         return service.successResponse({ data: { verified: true }, message: 'Otp verified successfully', status: HTTP_STATUS_CODE.OK })
//     } catch (error: any) {
//         return service.errorResponse({
//             error: error?.message,
//             message: error?.message,
//         });
//     }
// }

export {
  register,
  login,
  sendOneTimePassword,
  verifyOTP,
  isExistingUser,
  findDomain,
};
