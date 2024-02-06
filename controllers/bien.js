import {db} from "../conexion.js";



 

export const crearBien = async (req, res) => {
    try {
        const { nombre, descripcion, categoria } = req.body;

        // Validamos los campos
        if (!nombre || !descripcion || !categoria) {
            return res.status(400).json({ error: "Nombre, descripción y categoría son requeridos" });
        }

        // Validamos si ya existe este bien
        const [data] = await db.execute("SELECT * FROM bien WHERE nombre = ?", [nombre]);
        if (data.length) {
            return res.status(409).json("Este bien ya se encuentra registrado");
        }

        // Insertamos los datos en la tabla bien
        const [result] = await db.execute("INSERT INTO bien (nombre, descripcion, id_categoria) VALUES (?, ?, ?)", [nombre, descripcion, categoria]);
        return res.status(200).json("Bien registrado correctamente");
    } catch (error) {
        console.error(error);
        res.status(500).json(error.message);
    }
};

export const actualizarBien = async (req, res) => {
    try {
        const { nombre, descripcion, categoria } = req.body;
        const { id_bien } = req.params;

        // Validamos los campos
        if (!nombre || !descripcion || !categoria) {
            return res.status(400).json({ error: "Nombre, descripción y categoría son requeridos" });
        }

        // Validamos si ya existe este bien
        const [data] = await db.execute("SELECT * FROM bien WHERE id_bien = ?", [id_bien]);
        if (data.length === 0) {
            return res.status(404).json("Este bien no existe, no se puede actualizar");
        }

        // Actualizamos el bien
        const [result] = await db.execute("UPDATE bien SET nombre = ?, descripcion = ?, id_categoria = ? WHERE id_bien = ?", [nombre, descripcion, categoria, id_bien]);
        return res.status(200).json("Bien actualizado correctamente");
    } catch (error) {
        console.error(error);
        res.status(500).json(error.message);
    }
};

export const obtenerBienes = async (req, res) => {
    try {
        const [bienes] = await db.execute("SELECT b.id_bien, b.nombre, b.descripcion, c.nombre AS categoria FROM bien AS b LEFT JOIN categoria AS c ON b.id_categoria = c.id_categoria ORDER BY nombre");
        return res.status(200).json(bienes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al obtener la lista de bienes" });
    }
};

export const obtenerBienPorId = async (req, res) => {
    const id = req.params.id_bien;
    try {
        const [bien] = await db.execute("SELECT b.id_bien, b.nombre, b.descripcion, b.id_categoria, c.nombre AS categoria FROM bien AS b LEFT JOIN categoria AS c ON b.id_categoria = c.id_categoria WHERE b.id_bien = ?", [id]);
        if (bien.length === 0) {
            return res.status(404).json("Este bien no está registrado");
        }
        return res.status(200).json(bien[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al obtener el bien" });
    }
};



export const obtenerBienPorRango = async (req, res) => {
    try {
        const { fechaDesde, fechaHasta } = req.query;

        // Consultar bienes por rango de fecha
        const [data] = await db.execute("SELECT * FROM bien WHERE fecha_adquisicion BETWEEN ? AND ?", [fechaDesde, fechaHasta]);

        if (data.length === 0) {
            return res.status(404).json("No se encontraron bienes por este rango de fechas");
        }

        // Devolver la lista de bienes ordenados por título
        return res.status(200).json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al obtener la lista de bienes" });
    }
};

export const eliminarBien = async (req, res) => {
    try {
        const id = req.params.id;

        // Consulta para eliminar un bien por su id
        const [result] = await db.execute("DELETE  FROM bien WHERE id_bien = ?", [id]);

        // Bien eliminado exitosamente
        return res.status(200).json("Bien eliminado correctamente");
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al eliminar el bien" });
    }
};

export const obtenerEjemplares = async (req, res) => {
    const id = req.params.id;
    try {
        const q = `SELECT
            eb.id_variacion,
            eb.codigo_ejemplar,
            eb.ubicacion,
            eb.estado,
            eb.valor,
            eb.id_incorporacion
            FROM
            bien AS b
            JOIN
            ejemplar_bien AS eb ON b.id_bien = eb.id_bien
            WHERE
            b.id_bien  = ? 
        `;
        const [data] = await db.execute(q, [id]);

        if (data.length === 0) {
            return res.send({ error: "No existen bienes en esta incorporación" });
        }

        // Devolver la lista de bienes
        return res.status(200).json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al obtener los datos" });
    }
};

export const obtenerEjemplaresPorCategoria = async (req, res) => {
    const id = req.params.id;
    try {
        const q = `SELECT eb.codigo_ejemplar, eb.id_variacion , b.nombre
            FROM ejemplar_bien AS eb
            JOIN bien AS b ON eb.id_bien = b.id_bien
            WHERE b.id_categoria =  ? AND eb.estado = 'disponible'
        `;
        const [data] = await db.execute(q, [id]);

        if (data.length === 0) {
            return res.send({ error: "Sin bienes con esta categoría" });
        }

        // Devolver la lista de bienes
        return res.status(200).json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al obtener los datos" });
    }
};

export const generarCatalogo = async (req, res) => {
    try {
        const q = `SELECT 
            eb.id_variacion,
            eb.codigo_ejemplar,
            eb.ubicacion,
            eb.estado,
            eb.valor,
            eb.id_incorporacion,
            b.nombre AS nombre_bien,
            b.descripcion AS descripcion_bien,
            c.nombre AS nombre_categoria,
            c.descripcion AS descripcion_categoria
            FROM ejemplar_bien eb
            JOIN bien b ON eb.id_bien = b.id_bien
            JOIN categoria c ON b.id_categoria = c.id_categoria
        `;
        const [data] = await db.execute(q);

        if (data.length === 0) {
            return res.send({ error: "No existen bienes" });
        }

        // Devolver la lista de bienes
        return res.status(200).json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al obtener los datos" });
    }
};