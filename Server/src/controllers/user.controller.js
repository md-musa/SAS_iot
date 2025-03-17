const UserModel = require("../models/user.model")

const createUser = async (req, res) => {
    console.log(req.body);

    const user = new UserModel(req.body);
    await user.save();
    res.status(201).json({
        messege: "User created successfully",
        name: user.name,
        role: user.role,
        userID: user.userID,
        dep: user.dep
    })
}

const getUser = async (req, res) => {
    console.log(req.body);
    const { nfcUID } = req.body;
    if (!nfcUID) throw new Error("nfcUID is required")

    const user = await UserModel.find({ nfcUID });
    res.json(user);
}

const UserController = {
    createUser,
    getUser
}

module.exports = UserController;