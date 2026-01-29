import jwt from 'jsonwebtoken'

export function generateToken(userId, res) {
    const payload = {id: userId};
    const token = jwt.sign(payload, process.env.JWT, {
        expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    });

    res.cookie("jwt", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSize: "strict",
        maxAge: (1000 * 60 * 60 * 24) * 7
    });
    return token;
}
