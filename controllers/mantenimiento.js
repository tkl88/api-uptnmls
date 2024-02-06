import { db } from "../conexion.js";

export const obtenerTecnicos = async (req, res) => {
  try {
      const q = "SELECT nombre, id as id_tecnico FROM tecnico ORDER BY nombre";
      const [data] = await db.execute(q);
      return res.status(200).json(data);
  } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Error al obtener la lista de técnicos" });
  }
};

export const obtenerMantenimientos = async (req, res) => {
  try {
      const q = `SELECT
          M.id_mantenimiento,
          M.fecha_mantenimiento,
          M.descripcion,
          M.fecha_finalizacion,
          M.costo,
          U.id_usuario AS id_usuario_mantenimiento,
          U.nombre AS nombre_usuario_mantenimiento,
          U.apellido AS apellido_usuario_mantenimiento,
          U.email AS email_usuario_mantenimiento,
          U.rol AS rol_usuario_mantenimiento,
          T.id AS id_tecnico,
          T.nombre AS nombre_tecnico,
          T.descripcion AS descripcion_tecnico,
          T.telefono AS telefono_tecnico,
          T.sector AS sector_tecnico,
          T.calle AS calle_tecnico,
          T.local AS local_tecnico
      FROM
          mantenimiento M
      JOIN
          tecnico T ON M.id_tecnico = T.id
      JOIN
          usuario U ON M.id_usuario = U.id_usuario`;
      const [data] = await db.execute(q);
      return res.status(200).json(data);
  } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Error al obtener la lista de mantenimientos" });
  }
};

export const obtenerMantenimientoParaResumen = async (req, res) => {
  const { id } = req.params;
  try {
      const consulta = `
          SELECT
              M.id_mantenimiento,
              M.fecha_mantenimiento,
              M.descripcion,
              M.costo,
              M.estado,
              M.fecha_finalizacion,
              U.id_usuario AS id_usuario_mantenimiento,
              U.nombre AS nombre_usuario_mantenimiento,
              U.apellido AS apellido_usuario_mantenimiento,
              U.email AS email_usuario_mantenimiento,
              U.rol AS rol_usuario_mantenimiento,
              T.id AS id_tecnico,
              T.nombre AS nombre_tecnico,
              T.descripcion AS descripcion_tecnico,
              T.telefono AS telefono_tecnico,
              T.sector AS sector_tecnico,
              T.calle AS calle_tecnico,
              T.local AS local_tecnico
          FROM
              mantenimiento M
          JOIN
              tecnico T ON M.id_tecnico = T.id
          JOIN
              usuario U ON M.id_usuario = U.id_usuario
          WHERE M.id_mantenimiento = ?`;
      
      const [data] = await db.execute(consulta, [id]);
      if (data.length === 0) return res.status(404).json("Mantenimiento no encontrado");
      return res.status(200).json(data[0]);
  } catch (error) {
      console.error(error);
      return res.status(500).json(error.message);
  }
};

export const registrarMantenimiento = async (req, res) => {
  try {
      const { transferencia, bienes } = req.body;

      const q = `INSERT INTO mantenimiento (fecha_mantenimiento, descripcion, costo, id_usuario, id_tecnico) VALUES (?, ?, ?, ?, ?)`;
      const [data] = await db.execute(q, [transferencia.fecha_transferecia, transferencia.motivo, transferencia.costo, transferencia.usuario_id, transferencia.id_tecnico]);

      const id_transferencia = data.insertId;

      const bienesConId = bienes.map((bien) => ({
          ...bien,
          id_transferencia,
      }));

      const q2 = `INSERT INTO bien_mantenimiento (id_bien, id_mantenimiento) VALUES ?`;
      const bienesValues = bienesConId.map((bien) => [bien.id_ejemplar_bien, bien.id_transferencia]);
      await db.execute(q2, [bienesValues]);

      const q3 = "UPDATE ejemplar_bien SET estado = ?, ubicacion = ? WHERE id_variacion = ?";
      const updateValues = bienesConId.map((bien) => ["En Mantenimiento", bien.ubicacion, bien.id_ejemplar_bien]);
      
      for (const values of updateValues) {
          await db.execute(q3, values);
      }

      res.status(200).json('Mantenimiento registrado exitosamente.');
  } catch (error) {
      console.error('Error al registrar el mantenimiento:', error);
      res.status(500).json({ error: 'Error al registrar el mantenimiento.' });
  }
};

  
export const obtenerBienesMantenimiento = async (req, res) => {
  const id = req.params.id;
  try {
      const q = `
          SELECT
              ba.id_bien_mantenimiento,
              ba.id_bien,
              ba.id_mantenimiento,
              eb.id_variacion,
              eb.codigo_ejemplar,
              eb.ubicacion,
              eb.estado,
              eb.valor,
              b.nombre AS nombre_bien,
              b.descripcion AS descripcion_bien
          FROM
              bien_mantenimiento AS ba
          JOIN
              ejemplar_bien AS eb ON ba.id_bien = eb.id_variacion
          JOIN
              bien AS b ON eb.id_bien = b.id_bien
          WHERE
              ba.id_mantenimiento = ?`;
      
      const [data] = await db.execute(q, [id]);
      if (data.length === 0) {
          return res.status(404).json({ error: "No existen bienes en este mantenimiento" });
      }
      return res.status(200).json(data);
  } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Error al obtener los datos" });
  }
};

export const obtenerMantenimientoPorRangoDeFecha = async (req, res) => {
  const { fechaInicio, fechaFin } = req.query;
  try {
      const consulta = `
          SELECT
              M.id_mantenimiento,
              M.fecha_mantenimiento,
              M.descripcion,
              M.costo,
              M.estado,
              M.fecha_finalizacion,
              U.id_usuario AS id_usuario_mantenimiento,
              U.nombre AS nombre_usuario_mantenimiento,
              U.apellido AS apellido_usuario_mantenimiento,
              U.email AS email_usuario_mantenimiento,
              U.rol AS rol_usuario_mantenimiento,
              T.id AS id_tecnico,
              T.nombre AS nombre_tecnico,
              T.descripcion AS descripcion_tecnico,
              T.telefono AS telefono_tecnico,
              T.sector AS sector_tecnico,
              T.calle AS calle_tecnico,
              T.local AS local_tecnico
          FROM
              mantenimiento M
          JOIN
              tecnico T ON M.id_tecnico = T.id
          JOIN
              usuario U ON M.id_usuario = U.id_usuario
          WHERE
              M.fecha_mantenimiento BETWEEN ? AND ?`;
      
      const [data] = await db.execute(consulta, [fechaInicio, fechaFin]);
      return res.status(200).json(data);
  } catch (error) {
      console.error(error);
      return res.status(500).json(error.message);
  }
};


export const eliminarMantenimiento = async (req, res) => {
  const { id } = req.params;
  try {
      // Verificar si el mantenimiento existe
      const verificarExistencia = "SELECT * FROM mantenimiento WHERE id_mantenimiento = ?";
      const [existencia] = await db.execute(verificarExistencia, [id]);

      if (existencia.length === 0) {
          return res.status(404).json({ error: "Mantenimiento no encontrado" });
      }

      // Eliminar el mantenimiento
      const eliminarMantenimiento = "DELETE FROM mantenimiento WHERE id_mantenimiento = ?";
      await db.execute(eliminarMantenimiento, [id]);

      return res.status(200).json("Mantenimiento eliminado correctamente");
  } catch (error) {
      console.error(error);
      res.status(500).json(error.message);
  }
};

export const finalizarMantenimiento = async (req, res) => {
  const { id } = req.params;
  try {
      // Verificar si el mantenimiento existe
      const verificarExistencia = "SELECT * FROM mantenimiento WHERE id_mantenimiento = ?";
      const [existencia] = await db.execute(verificarExistencia, [id]);

      if (existencia.length === 0) {
          return res.status(404).json({ error: "Mantenimiento no encontrado" });
      }

      // Obtener la fecha de hoy
      const fechaHoy = new Date().toISOString().split('T')[0];

      // Actualizar el estado y la fecha de finalización del mantenimiento
      const actualizarMantenimiento = "UPDATE mantenimiento SET estado = 'Finalizado', fecha_finalizacion = ? WHERE id_mantenimiento = ?";
      await db.execute(actualizarMantenimiento, [fechaHoy, id]);

      // Actualizar el estado de los bienes asociados a este mantenimiento en ejemplar_bien
      const actualizarBienes = "UPDATE ejemplar_bien SET estado = 'asignado' WHERE id_variacion IN (SELECT id_bien FROM bien_mantenimiento WHERE id_mantenimiento = ?)";
      await db.execute(actualizarBienes, [id]);

      return res.status(200).json("Mantenimiento finalizado y bienes asignados correctamente");
  } catch (error) {
      console.error(error);
      res.status(500).json(error.message);
  }
};

export const obtenerMatenimientoParaResumen = async (req, res) => {
  const { id } = req.params;
  try {
      const consulta = `
          SELECT
              M.id_mantenimiento,
              M.fecha_mantenimiento,
              M.descripcion,
              M.costo,
              M.estado,
              M.fecha_finalizacion,
              U.id_usuario AS id_usuario_mantenimiento,
              U.nombre AS nombre_usuario_mantenimiento,
              U.apellido AS apellido_usuario_mantenimiento,
              U.email AS email_usuario_mantenimiento,
              U.rol AS rol_usuario_mantenimiento,
              T.id AS id_tecnico,
              T.nombre AS nombre_tecnico,
              T.descripcion AS descripcion_tecnico,
              T.telefono AS telefono_tecnico,
              T.sector AS sector_tecnico,
              T.calle AS calle_tecnico,
              T.local AS local_tecnico
          FROM
              mantenimiento M
          JOIN
              tecnico T ON M.id_tecnico = T.id
          JOIN
              usuario U ON M.id_usuario = U.id_usuario
          WHERE
              M.id_mantenimiento = ?;
      `;
      
      const [rows] = await db.execute(consulta, [id]);

      if (rows.length === 0) {
          return res.status(404).json("Mantenimiento no encontrado");
      }

      return res.status(200).json(rows[0]);
  } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Error interno del servidor" });
  }
};
