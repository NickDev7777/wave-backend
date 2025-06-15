require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({
  origin: 'https://thriving-syrniki-f724c9.netlify.app',
  credentials: true
}));
app.use(bodyParser.json());

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('✅ Conectado a MongoDB'))
  .catch(err => console.error('❌ Error al conectar MongoDB:', err));

const authRoutes = require('./routes/authRoutes');
app.use('/api', authRoutes);

app.listen(port, () => {
  console.log(`🚀 Servidor corriendo en el puerto ${port}`);
});
