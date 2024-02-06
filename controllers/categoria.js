import { db } from "../conexion.js";

export const crearCategoria = async (req, res) => {
    const { nombre, descripcion } = req.body;

    try {
        // Validamos los campos
        if (!nombre || !descripcion) {
            return res.status(400).json({ error: "El nombre y la descripción son requeridos" });
        }

        // Validamos si ya existe esta categoría
        const [categorias] = await db.execute("SELECT * FROM categoria WHERE nombre = ?", [nombre]);
        if (categorias.length > 0) {
            return res.status(409).json("Esta categoría ya se encuentra registrada");
        }

        // Insertamos los datos en la tabla categoria
        const categoriaQuery = "INSERT INTO categoria (nombre, descripcion) VALUES (?, ?)";
        const result = await db.execute(categoriaQuery, [nombre, descripcion]);

        return res.status(200).json("Categoría registrada correctamente");
    } catch (error) {
        console.error(error);
        res.status(500).json(error.message);
    }
};

export const obtenerCategorias = async (req, res) => {
    try {
        const [categorias] = await db.execute("SELECT * FROM categoria ORDER BY nombre");
        return res.status(200).json(categorias);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al obtener la lista de categorías" });
    }
};

export const eliminarCategoria = async (req, res) => {
    try {
        const { codigo } = req.params;
        const [result] = await db.execute("DELETE FROM categoria WHERE id_categoria = ?", [codigo]);
        if (result.affectedRows === 0) {
            return res.status(404).json("Categoría no encontrada, no se pudo eliminar");
        }
        return res.status(200).json("Categoría eliminada correctamente");
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al eliminar la categoría" });
    }
};

export const obtenerCategoriaPorId = async (req, res) => {
    try {
        const { codigo } = req.params;
        const [categoria] = await db.execute("SELECT * FROM categoria WHERE id_categoria = ?", [codigo]);
        if (categoria.length === 0) {
            return res.status(404).json("Categoría no encontrada");
        }
        return res.status(200).json(categoria[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al obtener la categoría" });
    }
};

export const actualizarCategoria = async (req, res) => {
    try {
        const { codigo } = req.params;
        const { nombre, descripcion } = req.body;

        // Validar los campos
        if (!nombre || !descripcion) {
            return res.status(400).json({ error: "Nombre y descripción son requeridos" });
        }

        // Actualizar la categoría
        const [result] = await db.execute("UPDATE categoria SET nombre = ?, descripcion = ? WHERE id_categoria = ?", [nombre, descripcion, codigo]);
        if (result.affectedRows === 0) {
            return res.status(404).json("Categoría no encontrada, no se pudo actualizar");
        }
        return res.status(200).json("Categoría actualizada correctamente");
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al actualizar la categoría" });
    }
};
