const jwt = require('jsonwebtoken');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Conexión a MongoDB
mongoose.connect('mongodb+srv://nickchitty:324EfcIP9T0vMia4@nwordauth.wrtd7cg.mongodb.net/NWordAuth?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("MongoDB conectado"))
  .catch(err => console.error(err));

// Modelo de usuario
const User = mongoose.model('User', new mongoose.Schema({
  username: String,
  email: String,
  password: String,
}));

// Ruta de registro

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || user.password !== password)
    return res.status(401).json({ message: 'Credenciales inválidas' });

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
  res.json({ message: 'Login exitoso', token });
});

app.post('/api/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Correo ya en uso' });

    const user = new User({ username, email, password });
    await user.save();
    res.status(200).json({ message: 'Usuario registrado' });
  } catch (err) {
    res.status(500).json({ message: 'Error al registrar' });
  }
});

// Iniciar servidor
app.listen(3000, () => console.log("Servidor corriendo en el puerto 3000"));
