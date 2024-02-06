import { db } from "../conexion.js";

export const crearTransferencia = async (req, res) => {
  try {
      const { transferencia, bienes } = req.body;

      const anioActual = new Date().getFullYear().toString();

      // Consultar el número de secuencia actual para este año
      const r = `SELECT MAX(CAST(SUBSTRING(codigo, 5) AS UNSIGNED)) as ultimoNumero
          FROM transferencia
          WHERE SUBSTRING(codigo, 1, 4) = ?`;

      const [rows] = await db.execute(r, [anioActual]);
      const ultimoNumero = rows[0].ultimoNumero || 0;
      const nuevoNumero = ultimoNumero + 1;
      const codigo_asignacion = anioActual + String(nuevoNumero).padStart(2, '0');

      const q = `INSERT INTO transferencia (departamento_origen_id, departamento_destino_id, fecha_transferencia, id_usuario, motivo, codigo, estado) VALUES (?, ?, ?, ?, ?, ?, ?)`;

      const [data] = await db.execute(q, [transferencia.departamento_origen_id, transferencia.departamento_destino_id, transferencia.fecha_incorporacion, transferencia.usuario_id, transferencia.motivo, codigo_asignacion, 'En proceso']);

      const id_transferencia = data.insertId;

      const bienesConId = bienes.map((bien) => ({
          ...bien,
          id_transferencia,
      }));

      const q2 = `INSERT INTO bienes_transferidos (id_ejemplar_bien, id_transferencia) VALUES ?`;

      const bienesValues = bienesConId.map((bien) => [bien.id_bien, bien.id_transferencia]);

      await db.execute(q2, [bienesValues]);

      const q3 = "UPDATE ejemplar_bien SET estado = ?, ubicacion = ? WHERE id_variacion = ?";
      const updateValues = bienesConId.map((bien) => ["Transferido", bien.valor, bien.id_bien]);

      for (const values of updateValues) {
          await db.execute(q3, values);
      }

      res.status(200).json('Transferencia registrada exitosamente.');
  } catch (error) {
      console.error('Error al registrar la asignación:', error);
      res.status(500).json({ error: 'Error al registrar la asignación.' });
  }
};

export const actualizarAsignacion = async (req, res) => {
  const { id_asignacion, bien_id, departamento_id, fecha_asignacion, usuario_id, estado } = req.body;
  try {
      const consulta = "UPDATE asignacion SET bien_id = ?, departamento_id = ?, fecha_asignacion = ?, usuario_id = ?, estado = ? WHERE id_asignacion = ?";
      const valores = [bien_id, departamento_id, fecha_asignacion, usuario_id, estado, id_asignacion];
      await db.execute(consulta, valores);
      res.status(200).json("Asignación actualizada correctamente");
  } catch (error) {
      console.error(error);
      res.status(500).json(error.message);
  }
};

export const obtenerTransferencias = async (req, res) => {
  try {
      const consulta =  `SELECT
      t.id_transferencia,
      t.fecha_transferencia,
      t.motivo,
      t.codigo,
      t.estado,
      d1.nombre AS nombre_origen,
      d2.nombre AS nombre_destino,
      CONCAT(u.nombre, ' ', u.apellido) AS nombre_usuario
  FROM
      transferencia t
  JOIN
      departamento d1 ON t.departamento_origen_id = d1.id_departamento
  JOIN
      departamento d2 ON t.departamento_destino_id = d2.id_departamento
  JOIN
      usuario u ON t.id_usuario = u.id_usuario`;
      const [data] = await db.execute(consulta);
      res.status(200).json(data);
  } catch (error) {
      console.error(error);
      res.status(500).json(error.message);
  }
};

export const obtenerAsignacionPorId = async (req, res) => {
  const { id } = req.params;
  try {
      const consulta = "SELECT * FROM asignacion WHERE id_asignacion = ?";
      const [data] = await db.execute(consulta, [id]);
      if (data.length === 0) return res.status(404).json("Asignación no encontrada");
      res.status(200).json(data[0]);
  } catch (error) {
      console.error(error);
      res.status(500).json(error.message);
  }
};

export const eliminarTransferenciaPorId = async (req, res) => {
  const { id } = req.params;
  try {
      const consulta = "DELETE FROM transferencia WHERE id_transferencia = ?";
      await db.execute(consulta, [id]);
      res.status(200).json("Transferencia eliminada correctamente");
  } catch (error) {
      console.error(error);
      res.status(500).json(error.message);
  }
};

export const obtenerAsignacionesPorRangoDeFecha = async (req, res) => {
  const { fechaInicio, fechaFin } = req.query;
  try {
      const consulta = "SELECT * FROM asignacion WHERE fecha_asignacion BETWEEN ? AND ?";
      const [data] = await db.execute(consulta, [fechaInicio, fechaFin]);
      res.status(200).json(data);
  } catch (error) {
      console.error(error);
      res.status(500).json(error.message);
  }
};

export const obtenerTransferenciaParaResumen = async (req, res) => {
  const { id } = req.params;
  try {
      const consulta = `SELECT t.id_transferencia, t.departamento_origen_id, d1.nombre AS nombre_origen, 
      t.departamento_destino_id, d2.nombre AS nombre_destino, t.fecha_transferencia, t.id_usuario, u.nombre AS nombre_usuario,
      u.apellido AS apellido_usuario, t.motivo, t.codigo, t.estado FROM transferencia AS t JOIN
      departamento AS d1 ON t.departamento_origen_id = d1.id_departamento JOIN departamento AS d2 ON 
      t.departamento_destino_id = d2.id_departamento JOIN usuario AS u ON t.id_usuario = u.id_usuario WHERE t.id_transferencia = ?`;
      const [data] = await db.execute(consulta, [id]);
      if (data.length === 0) return res.status(404).json("Transferencia no encontrada");
      res.status(200).json(data[0]);
  } catch (error) {
      console.error(error);
      res.status(500).json(error.message);
  }
};

export const obtenerTransferidos = async (req, res) => {
  const id = req.params.id;
  try {
      const q = `SELECT b.id_bien, b.nombre, b.descripcion, b.id_categoria, eb.id_variacion, eb.codigo_ejemplar,
       eb.ubicacion, eb.estado, eb.valor, eb.id_incorporacion, bt.id_bienes_transferidos, bt.id_ejemplar_bien,
        bt.id_transferencia FROM bien AS b JOIN ejemplar_bien AS eb ON b.id_bien = eb.id_bien
         JOIN bienes_transferidos AS bt ON eb.id_variacion = bt.id_ejemplar_bien WHERE bt.id_transferencia = ?`;
      const [data] = await db.execute(q, [id]);
      if (data.length === 0) return res.send({ error: "No existen bienes en esta transferencia" });
      res.status(200).json(data);
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error al obtener los datos" });
  }
};


export const obtenerTransferenciaPorRangoDeFecha = async (req, res) => {
  const { fechaInicio, fechaFin } = req.query;
  try {
      const consulta = `SELECT t.id_transferencia, t.departamento_origen_id, d1.nombre AS nombre_origen, 
          t.departamento_destino_id, d2.nombre AS nombre_destino, t.fecha_transferencia, t.id_usuario, u.nombre AS nombre_usuario,
          u.apellido AS apellido_usuario, t.motivo, t.codigo, t.estado FROM transferencia AS t JOIN
          departamento AS d1 ON t.departamento_origen_id = d1.id_departamento JOIN departamento AS d2 ON 
          t.departamento_destino_id = d2.id_departamento JOIN usuario AS u ON t.id_usuario = u.id_usuario WHERE t.fecha_transferencia BETWEEN ? AND ?`;
      const [data] = await db.execute(consulta, [fechaInicio, fechaFin]);
      res.status(200).json(data);
  } catch (error) {
      console.error(error);
      res.status(500).json(error.message);
  }
};

export const bienesTransferidosPorFecha = async (req, res) => {
  try {
      const { fechaInicial, fechaFinal } = req.query;

      // Realiza la consulta a la base de datos
      const query = `
          SELECT 
              bt.id_bienes_transferidos,
              b.nombre AS nombre_bien,
              t.fecha_transferencia,
              t.motivo,
              d_origen.nombre AS departamento_origen,
              d_destino.nombre AS departamento_destino
          FROM 
              transferencia AS t
          JOIN 
              bienes_transferidos AS bt ON t.id_transferencia = bt.id_transferencia
          JOIN 
              ejemplar_bien AS eb ON bt.id_ejemplar_bien = eb.id_variacion
          JOIN 
              bien AS b ON eb.id_bien = b.id_bien
          JOIN 
              departamento AS d_origen ON t.departamento_origen_id = d_origen.id_departamento
          JOIN 
              departamento AS d_destino ON t.departamento_destino_id = d_destino.id_departamento
          WHERE 
              t.fecha_transferencia BETWEEN ? AND ?
      `;
      const [data] = await db.execute(query, [fechaInicial, fechaFinal]);

      // Enviar la respuesta con los datos obtenidos de la base de datos
      res.json({ success: true, data: data });
  } catch (error) {
      console.error('Error al obtener bienes transferidos:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};
