import jwt from "jsonwebtoken";

export const protect = (req, res, next) => {
	const token = req.headers.authorization?.split(" ")[1];
	if (!token) return res.status(401).json({ message: "No token" });

	try {
		req.user = jwt.verify(token, process.env.JWT_SECRET);
		console.log("[auth:protect] verified token", {
			user: req.user,
			userId: req.user?.id,
		});
		next();
	} catch {
		res.status(401).json({ message: "Invalid token" });
	}
};