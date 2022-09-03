import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import { nanoid } from "nanoid";
import { decode } from "base64-arraybuffer";
import { unstable_getServerSession } from "next-auth/next";
import { authOptions } from "../../pages/api/auth/[...nextauth]";

const supabase = createClient(process.env.SUPABASE_URL as string, process.env.SUPABASE_KEY as string);

export const config = {
	api: {
		bodyParser: {
			sizeLimit: "10mb",
		},
	},
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	const session = await unstable_getServerSession(req, res, authOptions);

	if (!session) {
		res.status(401).json({ message: "You must be logged in." });
		return;
	}

	// Upload image to Supabase
	if (req.method === "POST") {
		console.log("POST photo begins");
		const { image } = req.body;

		if (!image) {
			console.log("There was no image");
			return res.status(500).json({ message: "No image provided" });
		}

		try {
			console.log("There was an image and try begins");
			const contentType = image.match(/data:(.*);base64/)?.[1];
			const base64FileData = image.split("base64,")?.[1];

			if (!contentType || !base64FileData) {
				console.log("Hit the first error of no content type or base64");
				return res.status(500).json({ message: "Image data not valid" });
			}

			// Upload image
			const fileName = nanoid();
			const ext = contentType.split("/")[1];
			const path = `${session.user?.id}/${fileName}.${ext}`;

			const { data, error: uploadError } = await supabase.storage.from(process.env.SUPABASE_BUCKET as string).upload(path, decode(base64FileData), {
				contentType,
				upsert: true,
			});
			console.log("The supabase storage bit is done");

			if (uploadError) {
				console.log("There was an upload error", uploadError);
				throw new Error("Unable to upload image to storage");
			}

			// Construct public URL
			// const url = `${(process.env.SUPABASE_URL as string).replace(".co", ".in")}/storage/v1/object/public/${data.path}`;
			const url = `${process.env.SUPABASE_URL as string}/storage/v1/object/public/taffy/${data.path}`;
			console.log("Sweet it is done and the image url is: ", url);

			return res.status(200).json({ url });
		} catch (e) {
			console.log("the try catch failed with the error", e);
			res.status(500).json({ message: "Something went wrong" });
		}
	} else {
		res.setHeader("Allow", ["POST"]);
		res.status(405).json({ message: `HTTP method ${req.method} is not supported.` });
	}
}
