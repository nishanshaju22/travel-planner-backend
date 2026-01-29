import jwt from 'jsonwebtoken';
import { prisma } from '../config/db.js';


export async function authMiddleware(req, res, next) {
    console.log("Auth middleware reached");

    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1];
    } else if (req.cookie?.jwt) {
        token = req.cookie.jwt;
    }

    if (!token) {
        return res.status(401).json({error: "Not Authorised"});
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT);
        const user = await prisma.user.findUnique({
            where: {id: decoded.id }
        })

        if (!user) {
            return res.status(401).json({error: "User no longer exists"});
        }

        req.user = user;
        next();
    } catch (err) {
        return res.status(401).json({error: "Not authorised"});
    }
};