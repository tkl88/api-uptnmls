import dotenv from "dotenv";
import mysql from "mysql2/promise";
dotenv.config();

// Configuración de la base de datos
const db_config = {
    host: process.env.HOSTDB,
    port: process.env.PORTDB,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE
};

let db;

async function handleDisconnect() {
    try {
        db = await mysql.createPool(db_config);

        db.on('error', async (err) => {
            console.error('Error de base de datos:', err);
            if (err.code === 'PROTOCOL_CONNECTION_LOST') {
                await handleDisconnect();
            } else {
                throw err;
            }
        });
    } catch (error) {
        console.error('Error al conectar a la base de datos:', error);
        setTimeout(handleDisconnect, 2000);
    }
}

handleDisconnect();

export { db };
