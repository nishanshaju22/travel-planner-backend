import { deleteUser, login, register, updateUserDetails } from "../manager/auth.js";

async function registerController(req, res) {
    const { name, email, password } = req.body;

    try {
        const result = await register(name, email, password, res);
        return res.status(201).json(result);
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
}

async function loginController(req, res) {
    const {email, password} = req.body;

    try {
        const result = await login(email, password, res);
        return res.status(201).json(result);
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
}

async function logoutController(req, res) {
    res.cookie('jwt', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 0,
    });

    res.status(200).json({
        status: 'success',
        message: 'Logged out successfully',
    });
}

async function removeUserController(req, res) {
    try {
        const result = await deleteUser(req.user);
        return res.status(201).json(result);
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
}

async function updateUserDetailsController(req, res) {
    
    const {email, password, name} = req.body
    
    try {
        const result = await updateUserDetails(req.user, email, password, name);
        return res.status(201).json(result);
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }

}

export { registerController, loginController, logoutController, removeUserController, updateUserDetailsController};