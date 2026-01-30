import User from "../models/user.model.js";

export const signup = async (req, res) => {
  const { email, password, name } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }
    const user = await User.create({ name, email, password });

    res
      .status(200)
      .json({ success: true, message: "User created successfully", user });
  } catch (error) {
    res.status(500).json(error.message);
  }
};

export const login = async (req, res) => {
  res.send("login route called");
};

export const logout = async (req, res) => {
  res.send("logout route called");
};
