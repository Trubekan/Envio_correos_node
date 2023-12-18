const nodemailer = require('nodemailer');
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
const PORT = 3000;

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('public'));

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'trubekanvh@gmail.com',
    pass: 'kpjq jcnq qcyq jmpr',
  },
});

// Función para enviar correo personalizado
const enviarCorreoPersonalizado = async (alumno) => {
  const mailOptions = {
    from: 'trubekanvh@gmail.com',
    to: alumno.correo,
    subject: 'Asunto del correo',
    text: `Hola ${alumno.alumno}, este es un mensaje personalizado para ti. Tus incidentes es: ${alumno.sem11 || alumno.sem16 || alumno.sem8 || 'No hay puntaje disponible'}.`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`Correo enviado a ${alumno.alumno}:`, info.response);
  } catch (error) {
    console.error(`Error al enviar el correo a ${alumno.alumno}:`, error);
  }
};

// Enviar correo inicial al iniciar la aplicación
app.listen(PORT, () => {
  console.log(`Servidor Node.js en http://localhost:${PORT}`);
  
});

// Ruta principal ("/")
app.get('/', async (req, res) => {
  try {
    // Consumir la API
    const response = await axios.get('http://ip172-18-0-30-clvmg4dnp9tg00fmvg80-5000.direct.labs.play-with-docker.com/resultados');
    const alumnos = response.data;

    // Renderizar formulario con Bootstrap
    const formHtml = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css">
        <title>Visualizar Alumnos</title>
      </head>
      <body class="container mt-5">
        <h1>Datos de Alumnos</h1>
        <table class="table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Correo</th>
              <th>Incidentes</th>
            </tr>
          </thead>
          <tbody>
            ${alumnos.map(alumno => `
              <tr>
                <td>${alumno.alumno}</td>
                <td>${alumno.correo}</td>
                <td>${alumno.sem11 || alumno.sem16 || alumno.sem8 || 'No hay puntaje disponible'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <form action="/enviar-correos" method="get">
          <button class="btn btn-primary" type="submit">Enviar Correos</button>
        </form>
      </body>
      </html>
    `;

    res.send(formHtml);
  } catch (error) {
    console.error('Error al consumir la API:', error.message);
    res.status(500).send('Hubo un error al consumir la API. Consulta la consola para más detalles.');
  }
});

// Ruta para enviar correos ("/enviar-correos")
app.get('/enviar-correos', async (req, res) => {
  try {
    // Consumir la API
    const response = await axios.get('http://ip172-18-0-30-clvmg4dnp9tg00fmvg80-5000.direct.labs.play-with-docker.com/resultados');
    const alumnos = response.data;

    // Recorrer la lista de alumnos y enviar correos personalizados
    for (const alumno of alumnos) {
      await enviarCorreoPersonalizado(alumno);
    }

    res.status(200).send('Correos enviados correctamente.');
  } catch (error) {
    console.error('Error al consumir la API o enviar los correos:', error.message);
    res.status(500).send('Hubo un error al consumir la API o enviar los correos. Consulta la consola para más detalles.');
  }
});
