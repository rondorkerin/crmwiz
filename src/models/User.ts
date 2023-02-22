import { UsersProfileGetResponse } from "@slack/web-api";
import { model, Schema, InferSchemaType } from "mongoose";

interface BaseMongooseType {
  id?: string;
  createdAt: NativeDate;
  updatedAt: NativeDate;
}

const schema = new Schema(
  {
    displayName: { type: String },
    firstName: { type: String, required: true },
    lastName: String,
    email: { type: String, required: true },
    orgName: { type: String, required: true },
    avatar: { type: String, required: true },
    slackOrgId: { type: String, required: true },
    slackUserId: { type: String, required: true },
  },
  { timestamps: true }
);

schema.virtual("id").get(function () {
  return this._id.toString();
});
schema.index({ slackUserId: 1, slackOrgId: 1 }, { unique: true });

export type User = InferSchemaType<typeof schema> & BaseMongooseType;

export const UserModel = model("User", schema);

export async function createUserFromSlackProfile(
  slackUserId: string,
  team: string | undefined,
  slackProfileResponse: UsersProfileGetResponse
): Promise<User> {
  const slackProfile = slackProfileResponse.profile;
  if (!team) {
    throw "You need a slack team to create a user";
  }
  if (!slackProfile) {
    throw "No slack profile available";
  }

  console.log("creating user", {
    displayName: slackProfile.display_name_normalized,
    firstName: slackProfile.first_name,
    lastName: slackProfile.last_name,
    email: slackProfile.email,
    slackUserId: slackUserId,
    slackOrgId: team,
    orgName: `${slackProfile.first_name}'s CRMs`,
    avatar: slackProfile.image_48,
  });
  await UserModel.updateOne(
    {
      slackUserId: slackUserId,
      slackOrgId: team,
    },
    {
      displayName: slackProfile.display_name_normalized,
      firstName: slackProfile.first_name,
      lastName: slackProfile.last_name,
      email: slackProfile.email,
      slackUserId: slackUserId,
      slackOrgId: team,
      orgName: `${slackProfile.first_name}'s CRMs`,
      avatar: slackProfile.image_48,
    },
    {
      upsert: true,
    }
  );
  const newUser = await getUserFromSlackEvent(slackUserId, team);

  if (newUser === null) {
    throw "Unable to create user";
  }
  return newUser as User;
}
export async function getUserFromSlackEvent(
  slackUserId: string,
  team: string | undefined
) {
  const user = await UserModel.findOne({
    slackUserId: slackUserId,
    slackOrgId: team,
  });
  return user;
}

export default UserModel;
