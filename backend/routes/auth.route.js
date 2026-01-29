import express from "express";

const router = express.Router();

router.get("/signup", (req, res) => {
  res.send("Sign Up route called");
});

router.get("/login", (req, res)=> {
    res.send("login route called")
})

router.get("/logout", (req, res)=> {
    res.send("logout route called")
})

export default router;
