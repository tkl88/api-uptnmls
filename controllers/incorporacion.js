import { db } from "../conexion.js";
import { v4 as uuidv4 } from 'uuid';
 

export const crearIncorporacion = async (req, res) => {
    const { incorporacion, bienes } = req.body;

    try {
        const anioActual = new Date().getFullYear().toString();

        // Consultar el número de secuencia actual para este año
        const [result] = await db.execute(
            `SELECT MAX(CAST(SUBSTRING(codigo_incorporacion, 5) AS UNSIGNED)) as ultimoNumero
            FROM incorporacion
            WHERE SUBSTRING(codigo_incorporacion, 1, 4) = ?`,
            [anioActual]
        );

        const ultimoNumero = result[0].ultimoNumero || 0;
        const nuevoNumero = ultimoNumero + 1;
        const codigo_incorporacion = anioActual + String(nuevoNumero).padStart(2, '0');

        // Inserta en la tabla incorporacion
        const [data1] = await db.execute("INSERT INTO incorporacion SET ?", [{ ...incorporacion, codigo_incorporacion }]);
        const incorporacionId = data1.insertId;

        // Actualiza el id_incorporacion en el objeto bienes y genera códigos de ejemplar únicos
        const bienesConId = bienes.map((bien) => ({
            ...bien,
            incorporacionId,
            codigo_ejemplar: uuidv4()
        }));

        // Inserta en la tabla ejemplar_bien
        const values = bienesConId.map((bien) => [bien.id_bien, bien.codigo_ejemplar, bien.estado, bien.valor, bien.incorporacionId]);
        await db.execute("INSERT INTO ejemplar_bien (id_bien, codigo_ejemplar, estado, valor, id_incorporacion) VALUES ?", [values]);

        res.status(200).json("Incorporación creada exitosamente.");
    } catch (error) {
        console.error("Error al crear la incorporación:", error);
        res.status(500).json({ error: "Error al crear la incorporación." });
    }
};

export const obtenerIncorporaciones = async (req, res) => {
    try {
        const [data] = await db.execute(`SELECT
            CONCAT(u.nombre, ' ', u.apellido) AS nombre_completo_usuario,
            p.nombre AS nombre_proveedor,
            i.id_incorporacion,
            i.fecha_incorporacion,
            i.cantidad,
            i.costo,
            i.codigo_incorporacion
        FROM
            incorporacion i
        JOIN
            usuario u ON i.id_usuario = u.id_usuario
        JOIN
            proveedor p ON i.id_proveedor = p.id_proveedor`);

        res.status(200).json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al obtener la lista de incorporaciones" });
    }
};

export const obtenerIncorporacion = async(req, res) => {
    const id = req.params.id;

    try {
        const [data] = await db.execute(`
            SELECT
                CONCAT(u.nombre, ' ', u.apellido) AS nombre_completo_usuario,
                p.nombre AS nombre_proveedor,
                i.id_incorporacion,
                i.fecha_incorporacion,
                i.cantidad,
                i.costo,
                i.codigo_incorporacion
            FROM
                incorporacion i
            JOIN
                usuario u ON i.id_usuario = u.id_usuario
            JOIN
                proveedor p ON i.id_proveedor = p.id_proveedor
            WHERE
                i.id_incorporacion = ?`,
            [id]
        );

        if (data.length === 0) {
            return res.status(404).json({ error: "Esta incorporación no está registrada" });
        }

        return res.status(200).json(data[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al obtener la incorporación" });
    }
};

export const obtenerBienesIncorporacion = async(req, res) => {
    const id = req.params.id;

    try {
        const [data] = await db.execute(`
            SELECT
                eb.id_variacion,
                eb.codigo_ejemplar,
                eb.ubicacion,
                eb.estado,
                eb.valor,
                eb.id_incorporacion,
                b.id_bien,
                b.nombre,
                b.descripcion,
                b.id_categoria
            FROM
                ejemplar_bien AS eb
            JOIN
                bien AS b ON eb.id_bien = b.id_bien
            WHERE
                id_incorporacion = ?`,
            [id]
        );

        if (data.length === 0) {
            return res.status(404).json({ error: "No existen bienes en esta incorporación" });
        }

        return res.status(200).json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al obtener los datos" });
    }
};


export const eliminarIncorporacion = async (req, res) => {
    try {
        const id = req.params.id;
        console.log(id);
     
        const deleteQuery = "DELETE FROM incorporacion WHERE id_incorporacion = ?";
    
        await db.execute(deleteQuery, [id]);
    
        return res.status(200).json("Incorporación eliminada correctamente");
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al eliminar la incorporación" });
    }
};

export const obtenerIncorporacionesPorRangoDeFechaPdf = async (req, res) => {
    try {
        const { fechaInicial, fechaFinal } = req.query;

        // Realiza la consulta a la base de datos
        const query = `
            SELECT 
                eb.id_variacion,
                b.nombre AS nombre_bien,
                eb.codigo_ejemplar,
                eb.ubicacion,
                eb.estado,
                eb.valor,
                i.fecha_incorporacion,
                p.nombre AS nombre_proveedor
            FROM 
                incorporacion AS i
            JOIN 
                ejemplar_bien AS eb ON i.id_incorporacion = eb.id_incorporacion
            JOIN 
                bien AS b ON eb.id_bien = b.id_bien
            JOIN 
                proveedor AS p ON i.id_proveedor = p.id_proveedor
            WHERE 
                i.fecha_incorporacion BETWEEN ? AND ?
        `;
        
        const [data] = await db.execute(query, [fechaInicial, fechaFinal]);
        return res.json({ success: true, data });
    } catch (error) {
        console.error('Error al obtener bienes incorporados:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
};
