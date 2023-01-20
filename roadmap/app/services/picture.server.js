const AWS = require("aws-sdk");
const {
  CELLAR_ADDON_HOST,
  CELLAR_ADDON_KEY_ID,
  CELLAR_ADDON_KEY_SECRET,
  PUBLIC_BUCKET_NAME,
} = require("../config");

export const uploadPublicPictureFromBuffer = async ({
  buffer,
  name,
  // stream,
  // filename,
  // encoding,
  mimetype,
}) => {
  const results = await new Promise((resolve, reject) => {
    const s3bucket = new AWS.S3({
      endpoint: CELLAR_ADDON_HOST,
      accessKeyId: CELLAR_ADDON_KEY_ID,
      secretAccessKey: CELLAR_ADDON_KEY_SECRET,
    });
    const params = {
      Bucket: PUBLIC_BUCKET_NAME,
      Key: `${name}.${mimetype.split("/").reverse()[0]}`,
      Body: buffer,
      ContentType: mimetype,
      ACL: "public-read",
      Metadata: { "Cache-Control": "max-age=31536000" },
    };
    s3bucket.upload(params, function (err, data) {
      if (err) return reject(`error in s3 callback: ${err}`);
      resolve(data);
    });
  });
  return results.Location; // the url of the picture
};
