import { v2 as cloudinary } from "cloudinary"

cloudinary.config({
	cloud_name: process.env.CLOUDINARY_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_SECRET_KEY
})

export const uploadImageToCloudinary = (buffer: Buffer, folder = "events") => {
	return new Promise<string>((resolve, reject) => {
		const stream = cloudinary.uploader.upload_stream(
			{ folder },
			(error, result) => {
				if (error || !result) {
					return reject(error || new Error("Image upload failed"))
				}
				resolve(result.secure_url)
			}
		)

		stream.end(buffer)
	})
}