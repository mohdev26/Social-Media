import { HydratedDocument, model, Model, Schema, Types } from "mongoose";
import { GenderEnum, RoleEnum } from "../../Utils/enums/user.enum";
import { generateHash } from "../../Utils/security/hash";
import { encrypt } from "../../Utils/security/encryption";
import { emailEvents } from "../../Utils/events/email.events";
import { generateOTP } from "../../Utils/generateOTP";

export interface IUser {
  _id: Types.ObjectId;
  firstName: string;
  lastName: string;
  username?: string;

  email: string;
  confirmEmailOTP?: string;
  confirmedAt?: Date;

  password: string;
  resetPasswordOTP?: string;

  phone: string;
  address?: string;

  gender: GenderEnum;
  role: RoleEnum;

  friends?: Types.ObjectId[];
  blockedUsers?: Types.ObjectId[];

  deviceTokens?: string[];
  notificationEnabled?: boolean;

  lastSeen:Date;

  createdAt: Date;
  updatedAt?: Date;
}

export const userSchema = new Schema<IUser>(
  {
    firstName: { type: String, required: true, minLength: 2, maxLength: 25 },
    lastName: { type: String, required: true, minLength: 2, maxLength: 25 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    confirmEmailOTP: String,
    confirmedAt: Date,
    password: { type: String, required: true },
    resetPasswordOTP: String,
    phone: {
      type: String,
      required: true,
    },
    address: String,
    gender: {
      type: String,
      enum: Object.values(GenderEnum),
      default: GenderEnum.MALE,
    },
    role: {
      type: String,
      enum: Object.values(RoleEnum),
      default: RoleEnum.USER,
    },
    friends: [{ type: Schema.Types.ObjectId, ref: "User" }],
    blockedUsers: [{ type: Schema.Types.ObjectId, ref: "User" }],

    deviceTokens: [{type: String}],
    notificationEnabled: {type:Boolean, default:true},
    lastSeen: {type: Date},
  },
  {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  },
);

userSchema
  .virtual("username")
  .set(function (value: string) {
    const [firstName, ...rest] = value.trim().split(/\s+/);
    this.set({ firstName, lastName: rest.join(" ") });
  })
  .get(function (this: IUser) {
    return `${this.firstName} ${this.lastName}`;
  });

userSchema.pre("validate", function () {
  this.email = this.email.toLocaleLowerCase().trim();
});

userSchema.pre(
  "save",
  async function (this: HUserDocument & { wasNew: boolean }) {
    this.wasNew = this.isNew;

    if (this.isModified("password")) {
      this.password = await generateHash(this.password);
    }
    if (this.isModified("phone")) {
      this.phone = await encrypt(this.phone);
    }
  },
);

userSchema.post("save", async function () {
  const that = this as HUserDocument & {wasNew: boolean};
  console.log(that.wasNew);
  if(that.wasNew){
    await emailEvents.emit("confirmEmail", {otp:generateOTP})
  }
  
});

export const UserModel: Model<IUser> = model<IUser>("User", userSchema);

export type HUserDocument = HydratedDocument<IUser>;
