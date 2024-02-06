import { db } from "../conexion.js";

export const crearAsignacion = async (req, res) => {
  try {
    const { asignacion, bienes } = req.body;

    const anioActual = new Date().getFullYear(); 

    // Consultar el número de secuencia actual para este año
    const r = `SELECT MAX(CAST(SUBSTRING(codigo, 5) AS UNSIGNED)) as ultimoNumero
                FROM asignacion
                WHERE SUBSTRING(codigo, 1, 4) = ?`;

    const [rows] = await db.execute(r, [anioActual]);
    const ultimoNumero = rows[0].ultimoNumero || 0; 
    const nuevoNumero = ultimoNumero + 1;  
    const codigo_asignacion = anioActual.toString() + String(nuevoNumero).padStart(2, '0');

    const q = `INSERT INTO asignacion (departamento_id, usuario_id, estado, fecha_asignacion, codigo) VALUES (?, ?, ?, ?, ?)`;

    // Registra la asignación en la tabla 'asignacion'
    const [result] = await db.execute(q, [asignacion.departamento_id, asignacion.usuario_id, asignacion.estado, asignacion.fecha_asignacion, codigo_asignacion]);
    const id_asignacion = result.insertId;

    // Actualiza el id_incorporacion en el objeto bienes
    const bienesConId = bienes.map((bien) => ({
      ...bien,
      id_asignacion,
    }));

    // Registra los bienes asignados en la tabla 'bienes_asignados'
    const q2 = `INSERT INTO bienes_asignados (id_ejemplar_bien, id_asignacion) VALUES ?`;

    // Construye un array de arrays para la inserción múltiple
    const bienesValues = bienesConId.map((bien) => [bien.id_ejemplar_bien, bien.id_asignacion]);

    await db.execute(q2, [bienesValues]);

    const q3 = "UPDATE ejemplar_bien SET estado = ?, ubicacion = ? WHERE id_variacion = ?";
    const updateValues = bienesConId.map((bien) => ["Asignado", bien.ubicacion, bien.id_ejemplar_bien]);

    for (const values of updateValues) {
      await db.execute(q3, values);
    }

    res.status(200).json('Asignación registrada exitosamente.');

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

export const obtenerTodasLasAsignaciones = async (req, res) => {
  try {
    const consulta =  `SELECT asignacion.*, departamento.nombre AS nombre_departamento, CONCAT(usuario.nombre, ' ', usuario.apellido) AS nombre_completo_usuario FROM asignacion JOIN departamento ON asignacion.departamento_id = departamento.id_departamento JOIN usuario ON asignacion.usuario_id = usuario.id_usuario`;
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


export const eliminarAsignacionPorId = async (req, res) => {
  const { id } = req.params;
  try {
    const consulta = "DELETE FROM asignacion WHERE id_asignacion = ?";
    await db.execute(consulta, [id]);
    res.status(200).json("Asignación eliminada correctamente");
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


export const obtenerEjemplaresParaAsignacion = async (req, res) =>{
  try {
    const consulta = "SELECT eb.id_variacion, eb.codigo_ejemplar, eb.ubicacion, b.nombre FROM ejemplar_bien eb JOIN bien b ON eb.id_bien = b.id_bien WHERE eb.estado = 'disponible'";
    const [data] = await db.execute(consulta);
    if (data.length === 0) return res.status(404).json("Sin bienes disponibles");
    return res.status(200).json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json(error.message);
  }
} 

export const obtenerAsignacionParaResumen = async (req, res) =>{
  const { id } = req.params;
  try {
    const consulta = `SELECT a.id_asignacion, a.departamento_id, a.fecha_asignacion, a.usuario_id, a.estado, a.codigo, 
    d.nombre AS nombre_departamento, u.nombre AS nombre_usuario, u.apellido AS apellido_usuario 
    FROM asignacion AS a JOIN departamento AS d ON a.departamento_id = d.id_departamento JOIN usuario AS u ON a.usuario_id = u.id_usuario
     WHERE a.id_asignacion = ?`;
    const [data] = await db.execute(consulta, [id]);
    if (data.length === 0) return res.status(404).json("Asignación no encontrada");
    return res.status(200).json(data[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json(error.message);
  }
} 


export const obtenerBienesAsignados = async(req, res) =>{
  const id = req.params.id;
  console.log(id);
  try {
      const q = `SELECT 
      ba.id_bienes_asinados,
      ba.id_ejemplar_bien,
      ba.id_asignacion,
      ba.vigencia,
      eb.id_variacion,
      eb.codigo_ejemplar,
      eb.ubicacion,
      eb.estado,
      eb.valor,
      b.nombre AS nombre_bien,
      b.descripcion AS descripcion_bien
  FROM bienes_asignados AS ba
  JOIN ejemplar_bien AS eb ON ba.id_ejemplar_bien = eb.id_variacion
  JOIN bien AS b ON eb.id_bien = b.id_bien
  WHERE ba.id_asignacion = ?`;

      const [data] = await db.execute(q, [id]);

      if (data.length === 0) {
          return res.status(404).json({error: "No existen bienes en esta incorporación"});
      }

      return res.status(200).json(data);
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error al obtener los datos" });
  }
};

export const obtenerAsignacionesPorRango = async (req, res) => {
  const { fechaInicio, fechaFin } = req.query;
  try {
      const consulta = `SELECT 
      a.id_asignacion,
      a.fecha_asignacion,
      a.estado,
      a.codigo,
      a.vigencia,
      u.nombre AS nombre_usuario,
      u.apellido AS apellido_usuario,
      d.nombre AS nombre_departamento
  FROM asignacion a
  JOIN usuario u ON a.usuario_id = u.id_usuario
  JOIN departamento d ON a.departamento_id = d.id_departamento
  WHERE a.fecha_asignacion BETWEEN ? AND ?`;

      const [data] = await db.execute(consulta, [fechaInicio, fechaFin]);

      return res.status(200).json(data);
  } catch (error) {
      console.error(error);
      res.status(500).json(error.message);
  }
};


export const crearSolicitud = async (req, res) => {
  try {
    const { asignacion, bienes } = req.body;

    // Crear la solicitud en la tabla 'solicitud'
    const queryInsertSolicitud = "INSERT INTO solicitud (id_solicitante, tipo, estado, motivo) VALUES (?, ?, ?, ?)";
    const [insertSolicitud] = await db.execute(queryInsertSolicitud, [asignacion.usuario_id, asignacion.tipo, "En Proceso", asignacion.motivo]);
    const id_solicitud = insertSolicitud.insertId;

    // Crear los registros de bienes solicitados en la tabla 'bienes_solicitados'
    const values = bienes.map(bien => [bien.id_ejemplar_bien, id_solicitud]);
    const queryInsertBienes = "INSERT INTO bienes_solicitados (id_ejemplar_bien, id_solicitud) VALUES ?";
    await db.execute(queryInsertBienes, [values]);

    return res.status(200).json({ message: "Solicitud creada exitosamente." });
  } catch (error) {
    console.error("Error en la creación de la solicitud:", error);
    return res.status(500).json({ error: "Error en la creación de la solicitud." });
  }
};

export const obtenerTodasLasSolicitudes = async (req, res) => {
  try {
    const consulta =  `SELECT
    s.id_solicitud,
    s.id_solicitante,
    CONCAT(u.nombre, ' ', u.apellido) AS nombre_completo,
    s.tipo,
    s.estado,
    s.fecha_solicitud,
    s.motivo,
    bs.id_bien_solicitado,
    bs.id_ejemplar_bien
FROM
    solicitud s
JOIN
    usuario u ON s.id_solicitante = u.id_usuario
JOIN
    bienes_solicitados bs ON s.id_solicitud = bs.id_solicitud
`;
    const [data] = await db.execute(consulta);
    return res.status(200).json(data);
  } catch (error) {
    console.error(error);
    return res.status(500).json(error.message);
  }
};


export const obtenerSolicitudParaResumen = async (req, res) => {
  try {
    const { id } = req.params;
    const consulta = `SELECT
      s.id_solicitud,
      s.id_solicitante,
      CONCAT(u.nombre, ' ', u.apellido) AS nombre_completo,
      s.tipo,
      s.estado,
      s.fecha_solicitud,
      s.motivo,
      bs.id_bien_solicitado,
      bs.id_ejemplar_bien
    FROM
      solicitud s
    JOIN
      usuario u ON s.id_solicitante = u.id_usuario
    JOIN
      bienes_solicitados bs ON s.id_solicitud = bs.id_solicitud
    WHERE
      s.id_solicitud = ?`;
    const [data] = await db.execute(consulta, [id]);
    if (data.length === 0) return res.status(404).json("Solicitud no encontrada");
    return res.status(200).json(data[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json(error.message);
  }
};

export const estadoSolicitud = async (req, res) => {
  try {
    const idSolicitud = req.params.id;
    const { estado } = req.body;

    // Realizar la consulta SQL para actualizar el estado de la solicitud
    const query = `UPDATE solicitud SET estado = ? WHERE id_solicitud = ?`;
    await db.execute(query, [estado, idSolicitud]);

    res.status(200).json({ message: 'Estado de la solicitud actualizado correctamente' });
  } catch (error) {
    console.error('Error al actualizar el estado de la solicitud:', error);
    res.status(500).json({ error: 'Error al actualizar el estado de la solicitud' });
  }
};

 

export const obtenerBienesSolicitados = async (req, res) => {
  const id = req.params.id;
  try {
      const q = `SELECT bs.id_bien_solicitado, bs.id_ejemplar_bien, bs.id_solicitud, b.nombre AS nombre_bien, b.descripcion AS descripcion_bien, eb.codigo_ejemplar AS codigo_bien FROM bienes_solicitados bs JOIN solicitud s ON bs.id_solicitud = s.id_solicitud JOIN ejemplar_bien eb ON bs.id_ejemplar_bien = eb.id_variacion JOIN bien b ON eb.id_bien = b.id_bien WHERE s.id_solicitud = ?`;

      const [data] = await db.execute(q, [id]);

      if (data.length === 0) {
          return res.status(404).json({ error: "No existen bienes en esta solicitud" });
      }

      return res.status(200).json(data);
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error al obtener los datos" });
  }
};

export const bienesAsignadosPorFecha = async (req, res) => {
  try {
      const { fechaInicial, fechaFinal } = req.query;

      // Realiza la consulta a la base de datos
      const query = `
          SELECT 
              eb.codigo_ejemplar,
              b.nombre AS nombre_bien,
              eb.estado,
              a.fecha_asignacion
          FROM 
              asignacion AS a
          JOIN 
              bienes_asignados AS ba ON a.id_asignacion = ba.id_asignacion
          JOIN 
              ejemplar_bien AS eb ON ba.id_ejemplar_bien = eb.id_variacion
          JOIN 
              bien AS b ON eb.id_bien = b.id_bien
          WHERE 
              a.fecha_asignacion BETWEEN ? AND ?
      `;

      const [datos] = await db.execute(query, [fechaInicial, fechaFinal]);

      // Enviar la respuesta con los datos obtenidos de la base de datos
      res.json({ success: true, data: datos });
  } catch (error) {
      console.error('Error al obtener ejemplares asignados:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};
