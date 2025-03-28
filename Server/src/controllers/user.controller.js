const UserModel = require("../models/user.model");

const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw new Error("Email and password are required");

  const user = await UserModel.findOne({ email });
  if (!user) throw new Error("User not found");

  console.log(user.password, password);

  if (user.password !== password) throw new Error("Invalid password");

  res.json({
    message: "Login successful",
    name: user.name,
    role: user.role,
    userID: user.userID,
    dep: user.dep,
  });
};

const createUser = async (req, res) => {
  console.log(req.body);

  const user = new UserModel(req.body);
  await user.save();
  res.status(201).json({
    message: "User created successfully",
    name: user.name,
    role: user.role,
    userID: user.userID,
    dep: user.dep,
  });
};

const getUser = async (req, res) => {
  console.log(req.body);
  const { nfcUID } = req.body;
  if (!nfcUID) throw new Error("nfcUID is required");

  const user = await UserModel.find({ nfcUID });
  res.json(user);
};

const UserController = {
  createUser,
  getUser,
  login,
};

module.exports = UserController;
