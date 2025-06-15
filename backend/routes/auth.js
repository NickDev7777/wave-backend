const express = require("express");
const router = express.Router();
const User = require("../models/User");
const nodemailer = require("nodemailer");

router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;
  const existing = await User.findOne({ email });
  if (existing) return res.status(400).json({ msg: "Ya existe el correo" });

  const user = await User.create({ username, email, password });

  const transporter = nodemailer.createTransport({
    service: "gmail", // o tu proveedor (Ej: Brevo)
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Confirmación de registro",
    text: `Hola ${username}, ¡gracias por registrarte!`,
  });

  res.json({ msg: "Usuario creado y correo enviado" });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email, password });
  if (!user) return res.status(401).json({ msg: "Credenciales inválidas" });

  res.json({ msg: "Login exitoso", user });
});

module.exports = router;
