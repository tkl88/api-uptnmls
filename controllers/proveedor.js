import {db} from "../conexion.js";
import { v4 as uuidv4 } from 'uuid';


 

export const crearProveedor = async (req, res) => {
    try {
      const { nombre, email, direccion, telefono } = req.body;
  
      // Validamos los campos
      if (!nombre) {
        return res.status(400).json({ error: "El nombre es requerido" });
      }
      if (!email) {
        return res.status(400).json({ error: "El email es requerido" });
      }
      if (!telefono) {
        return res.status(400).json({ error: "El telefono es requerido" });
      }
  
      // Validamos si ya existe este proveedor
      const existente = await db.query("SELECT * FROM proveedor WHERE nombre = ?", [nombre]);
      if (existente.length > 0) {
        return res.status(409).json({ error: "Este proveedor ya se encuentra registrado" });
      }
  
      // Insertamos los datos en la tabla proveedor
      const insertQuery = "INSERT INTO proveedor (nombre, direccion, telefono, email) VALUES (?, ?, ?, ?)";
      const insertValues = [nombre, direccion, telefono, email];
      await db.query(insertQuery, insertValues);
  
      return res.status(200).json("Proveedor registrado correctamente");
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: error.message });
    }
  };
  
  export const actualizarProveedor = async (req, res) => {
    try {
      const { nombre, direccion, telefono, email } = req.body;
      const { id_proveedor } = req.params;
  
      // Validamos los campos
      if (!nombre) {
        return res.status(400).json({ error: "El nombre es requerido" });
      }
      if (!email) {
        return res.status(400).json({ error: "El email es requerido" });
      }
      if (!telefono) {
        return res.status(400).json({ error: "El telefono es requerido" });
      }
  
      // Verificamos si existe el proveedor a actualizar
      const proveedor = await db.query("SELECT * FROM proveedor WHERE id_proveedor = ?", [id_proveedor]);
      if (proveedor.length === 0) {
        return res.status(404).json({ error: "Este proveedor no existe, no se puede actualizar" });
      }
  
      // Actualizamos el proveedor
      const updateQuery = "UPDATE proveedor SET nombre = ?, direccion = ?, telefono = ?, email = ? WHERE id_proveedor = ?";
      const updateValues = [
        nombre || proveedor[0].nombre,
        direccion || proveedor[0].direccion,
        telefono || proveedor[0].telefono,
        email || proveedor[0].email,
        id_proveedor
      ];
      await db.query(updateQuery, updateValues);
  
      return res.status(200).json("Proveedor actualizado correctamente");
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: error.message });
    }
  };
  

export const obtenerProveedores = async (req, res) => {
    try {
      const q = "SELECT * FROM proveedor ORDER BY nombre";
      const [data] = await db.execute(q);
      return res.status(200).json(data);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error al obtener la lista de proveedores" });
    }
  };

  export const obtenerProveedorPorId = async (req, res) => {
    const id = req.params.id_proveedor;
    try {
      const q = "SELECT * FROM proveedor WHERE id_proveedor = ?";
      const [data] = await db.execute(q, [id]);
      if (data.length === 0) {
        return res.status(404).json({ error: "Este proveedor no está registrado" });
      }
      return res.status(200).json(data[0]);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error al obtener el proveedor" });
    }
  };

  export const eliminarProveedor = async (req, res) => {
    try {
      const id = req.params.id_proveedor;
      const deleteQuery = "DELETE FROM proveedor WHERE id_proveedor = ?";
      const [result] = await db.execute(deleteQuery, [id]);
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Proveedor no encontrado" });
      }
      return res.status(200).json("Proveedor eliminado correctamente");
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error en el sistema" });
    }
  };