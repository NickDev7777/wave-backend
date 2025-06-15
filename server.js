const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const nodemailer = require('nodemailer');

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors({
  origin: 'https://thriving-syrniki-f724c9.netlify.app'
}));

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Conectado a MongoDB'))
  .catch(err => console.error('Error de conexión:', err));

const User = mongoose.model('User', new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  verified: { type: Boolean, default: false },
}));

// Transporter de Brevo
const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  auth: {
    user: process.env.BREVO_EMAIL,
    pass: process.env.BREVO_PASS
  }
});

app.post('/api/register', async (req, res) => {
  const { username, email, password } = req.body;
  const exists = await User.findOne({ email });
  if (exists) return res.status(400).json({ error: 'Correo ya registrado' });

  const hash = await bcrypt.hash(password, 10);
  const user = await User.create({ username, email, password: hash });

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

  const url = `https://nwordauth.onrender.com/api/verify/${token}`;

  await transporter.sendMail({
    from: `"NWordAuth" <${process.env.BREVO_EMAIL}>`,
    to: email,
    subject: 'Verifica tu cuenta',
    html: `<p>Haz clic para verificar tu cuenta:</p><a href="${url}">${url}</a>`
  });

  res.json({ message: 'Registro exitoso, revisa tu correo' });
});

app.get('/api/verify/:token', async (req, res) => {
  try {
    const { id } = jwt.verify(req.params.token, process.env.JWT_SECRET);
    await User.findByIdAndUpdate(id, { verified: true });
    res.send('Cuenta verificada con éxito');
  } catch (e) {
    res.status(400).send('Token inválido');
  }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
  if (!user.verified) return res.status(403).json({ error: 'Cuenta no verificada' });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ error: 'Contraseña incorrecta' });

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, username: user.username });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
