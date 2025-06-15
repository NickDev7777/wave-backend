const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const router = express.Router();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) return res.status(400).json({ message: 'Usuario ya existe' });

  const hashed = await bcrypt.hash(password, 10);
  const user = new User({ username, email, password: hashed });
  await user.save();

  await transporter.sendMail({
    from: `"NWordAuth" <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'Bienvenido a NWordAuth',
    html: `<h1>Hola ${username}</h1><p>Tu cuenta ha sido creada correctamente.</p>`,
  });

  res.status(201).json({ message: 'Usuario registrado' });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: 'Usuario no encontrado' });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ message: 'Contraseña incorrecta' });

  res.status(200).json({ message: 'Login exitoso', user: { username: user.username, email: user.email } });
});

module.exports = router;
