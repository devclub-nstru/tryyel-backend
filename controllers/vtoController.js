import { InferenceClient } from "@huggingface/inference";
import axios from "axios";

import { InferenceClient } from "@huggingface/inference";
import axios from "axios";

export const tryOn = async (req, res) => {
  try {
    const { userImageUrl, clothImageUrl } = req.body;
    if (!userImageUrl || !clothImageUrl) {
      return res.status(400).json({
        success: false,
        message: "User image and cloth image URLs are required",
      });
    }
    const userImage = (
      await axios.get(userImageUrl, { responseType: "arraybuffer" })
    ).data;
    const clothImage = (
      await axios.get(clothImageUrl, { responseType: "arraybuffer" })
    ).data;
    const client = new InferenceClient(process.env.HF_TOKEN);
    const response = await client.imageToImage({
      provider: "fal-ai",
      model: "ovi054/virtual-tryon-kontext-lora",
      inputs: userImage,
      parameters: {
        prompt: "virtual try-on of the provided clothing item",
        lora: [
          {
            weight: clothImage,
          },
        ],
      },
    });
    const arrayBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    return res.status(200).json({
      success: true,
      resultImage: `data:image/png;base64,${base64}`,
    });
  } catch (error) {
    console.error("VTO generation ERROR ", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error in VTO generation",
    });
  }
};
