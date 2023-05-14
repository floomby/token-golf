// Stream the uploaded file into mongodb (GridFS)

import { NextApiRequest, NextApiResponse } from "next";
import { getServerAuthSession } from "../../../server/auth";
import { IncomingForm, Fields, Files } from "formidable";
import { lookup } from "mime-types";
import db from "~/utils/db";
import mongoose from "mongoose";
import { Profile } from "~/utils/odm";

export const config = {
  api: {
    bodyParser: false,
  },
};

// Fragile form upload (only takes the file adding other fields will break it)
// Also I am violating rest principles by having parameters in a POST request
export default async (req: NextApiRequest, res: NextApiResponse) => {
  // t3 gives us this helper function to get the session
  const serverSession = await getServerAuthSession({ req, res });
  if (!serverSession?.user) {
    res.status(401);
    res.end();
    return;
  }

  const { method } = req;
  if (method !== "POST") {
    res.status(405);
    res.end();
    return;
  }

  const { filename } = req.query;

  // Put other validation checks here
  if (typeof filename !== "string") {
    res.status(400);
    res.end();
    return;
  }

  const mimeType = lookup(filename);

  if (!mimeType) {
    res.status(400);
    res.end();
    return;
  }

  // We may need to enforce mime type limitations in the future
  // if (mimeType !== "image/png" && mimeType !== "image/jpeg") {
  //   res.status(400);
  //   res.end();
  //   return;
  // }

  try {
    await db();
    const client = mongoose.connection.getClient();
    const bucket = new mongoose.mongo.GridFSBucket(client.db(), {
      bucketName: "images",
    });

    const uploadStream = bucket.openUploadStream(filename, {
      contentType: mimeType,
    });

    const data: { fields: Fields; files: Files } = await new Promise(
      (resolve, reject) => {
        const form = new IncomingForm({
          maxFileSize: 1024 * 1024 * 50, // 50MB
        });

        form.onPart = (part) => {
          part.on("data", (chunk) => {
            uploadStream.write(chunk);
          });
        };

        form.parse(req, (err, fields, files) => {
          if (err) return reject(err);
          resolve({ fields, files });
        });
      }
    );

    uploadStream.end();

    // The only images we can currently upload are profile images
    await Profile.updateOne(
      { email: serverSession.user.email },
      { image: `/api/images/${uploadStream.id}` }
    );

    res.status(200);
    res.end();
  } catch (e) {
    console.error(e);
    res.status(500);
    res.end();
  }
};
