import { contentType } from "mime-types";
import { NextApiRequest, NextApiResponse } from "next";
import db from "~/utils/db";
import mongoose from "mongoose";
import fs from "fs";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { method } = req;
  if (method !== "GET") {
    res.status(405);
    res.end();
    return;
  }

  try {
    const { id } = req.query;
    await db();
    const client = mongoose.connection.getClient();
    const bucket = new mongoose.mongo.GridFSBucket(client.db(), {
      bucketName: "images",
    });

    const image = await bucket
      .find({ _id: new mongoose.mongo.ObjectId(id as string) })
      .next();

    if (!image) {
      res.status(404);
      res.end();
      return;
    }

    const contentTypeValue = contentType(image.contentType || "");

    // If this is false we are in trouble whatever we do
    if (contentTypeValue) res.setHeader("Content-Type", contentTypeValue);
    res.setHeader("Content-Length", image.length.toString());
    // We want the browser to cache the image
    res.setHeader("Cache-Control", "max-age=315360000, immutable"); // 10 years

    const downloadStream = bucket.openDownloadStream(image._id);
    downloadStream.pipe(res);

    downloadStream.on("end", () => {
      res.status(200);
      res.end();
      return;
    });

    downloadStream.on("error", (err) => {
      console.error(err);
      res.status(500);
      res.end();
      return;
    });
  } catch (e) {
    console.error("The error is happening here", e);
    res.status(500);
    res.end();
  }
};
