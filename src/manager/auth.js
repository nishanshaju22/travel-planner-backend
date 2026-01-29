import { prisma } from "../config/db.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/generateToken.js";
import validator from "validator";

async function register(name, email, password, res) {

    if (!validator.isEmail(email)) {
        throw new Error("The email provided is not a valid email");
    }

    if (!validator.isAlpha(name, 'en-US', { ignore: '_- ' })) {
        throw new Error('Error: Name contains invalid characters');
    }

    if (nameLast.length < 2 || nameLast.length > 50) {
        throw new Error('Error: Name is either too large or too small');
    }

    if (password.length < 6) {
        throw new Error('Error: password is too small');
    }

    const isValid = /^(?=.*[A-Za-z])(?=.*\d).+$/.test(password);

    if (!isValid) {
        throw new Error("The password entred must contain at least one letter and one number");
    }

    const userExists = await prisma.user.findUnique({
        where: {email: email },
    })

    if (userExists) {
        throw new Error("User already exists with this email");
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPasswrod = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
        data: {
            name, 
            email,
            password: hashedPasswrod,
        }
    });
    
    generateToken(user.id, res);

    const data = {
        status: "success",
        data: {
            user: {
                id: user.id,
                name: name,
                email: email,
            },
        }
    }

    return data
}

async function login(email, password, res) {
    const user = await prisma.user.findUnique({
        where: { email: email },
    })

    if (!user) {
        throw new Error("Invalid email or password");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
        throw new Error("Invalid email or password");
    }
    
    generateToken(user.id, res);

    const data = {
        status: "success",
        data: {
            user: {
                id: user.id,
                name: user.name,
                email: email,
            },
        }
    };

    return data
}

async function deleteUser(user) {
    if (!user) {
        throw new Error("Unauthorized");
    }

    await prisma.user.delete({
        where: {id: user.id}
    });

    const data = {
        status: "success",
        message: "User deleted succesfully"
    };

    return data
}

async function updateUserDetails(user, email, password, name) {
    if (!user) {
        throw new Error("Unauthorized");
    }

    const currentUser = await prisma.user.findUnique({
        where: { id: user.id },
    });

    if (!currentUser) {
        throw new Error("User not found");
    }

    if (email !== undefined && email !== null && email !== currentUser.email) {
        const checkEmail = await prisma.user.findUnique({
            where: { email },
        });

        if (checkEmail) {
            throw new Error("User already exists with this email");
        }
    }

    const updateData = {
        email: email ?? currentUser.email,
        password: password ?? currentUser.password,
        name: name ?? currentUser.name,
        updatedAt: new Date()
    };

    const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: updateData,
    });

    return {
        status: "success",
        data: {
            user: updatedUser,
        },
    };
}

export { register, login, deleteUser, updateUserDetails }