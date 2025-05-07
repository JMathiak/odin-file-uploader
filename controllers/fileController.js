const { supabase } = require("../supabase");
const { decode } = require("base64-arraybuffer");

async function postImage(req, res) {
  try {
    const file = req.file;
    if (!file) {
      res.status(400).json({ message: "Please upload a file" });
      return;
    }
    const fileBase64 = decode(file.buffer.toString("base64"));
    const { data, error } = await supabase.storage
      .from("images")
      .upload(file.originalname, fileBase64, {
        contentType: "image/jpg",
      });
    if (error) {
      throw error;
    }

    const { date: image } = supabase.storage
      .from("images")
      .getPublicUrl(data.path);
    console.log(file);
    res.status(200).json({ image: image.getPublicUrl });
  } catch (error) {
    res.status(500).json({ error: error });
  }
}

module.export = {
  postImage,
};
