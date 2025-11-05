import express from 'express';
import cors from 'cors';

import dotenv from 'dotenv';

//Importación de jobs - Función se ejecuta cada día a las 11:59 PM
// y cierra todas las visitas que queden abiertas.
import { startJobs } from './jobs/closeVisitJobs.js';
import { closeMembresiasJob } from './jobs/closeMembresiasJob.js';
import { sendNotificationsJob } from './jobs/sendNotificationsJob.js';

//Importación de rutas
import authRouter from './routes/auth.js'; //Autenticación y login
import membresiasRouter from './routes/membresias.js'; //CRUD Membresías
import usuariosRouter from './routes/usuarios.js'; //CRUD Usuarios
import empleadosRouter from './routes/empleados.js'; //CRUD Empleados
import visitasRouter from './routes/visitas.js'; //CRUD Visitas
import pagosRouter from './routes/pagos.js';
import clasesRouter from './routes/clases.js';
import instructoresRouter from './routes/instructores.js';
import rolesRouter from './routes/roles.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import dashboardClienteRoutes from './routes/dashboardClienteRoutes.js';
import dashboardInstructoresRoutes from './routes/dashboardInstructoresRoutes.js';

//Configuración de variables de entorno
dotenv.config();

//Inicialización de app y configuración de cors y json
const app = express();
//Middleware
app.use(cors());
app.use(express.json());

//INICIALIZACIÓN DE JOBS DIARIOS
startJobs();
closeMembresiasJob();
sendNotificationsJob();

//Rutas
app.get('/', (req, res) => {
	res.send('Servidor de gym corriendo');
});

//Rutas de autenticación
app.use('/api/auth', authRouter);
app.use('/api/membresias', membresiasRouter);
app.use('/api/usuarios', usuariosRouter);
app.use('/api/empleados', empleadosRouter);
app.use('/api/visitas', visitasRouter);
app.use('/api/pagos', pagosRouter);
app.use('/api/instructores', instructoresRouter);
app.use('/api/clases', clasesRouter);
app.use('/api/roles', rolesRouter);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/dashboard-cliente', dashboardClienteRoutes);
app.use('/api/dashboard-instructor', dashboardInstructoresRoutes);

//Inicializar servidor en puerto 5000 o en la variable de entorno (.env)
const PORT = process.env.BACKEND_PORT || 5000;
app.listen(PORT, () => {
	console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
