import { db } from "../conexion.js";

export const crearDesincorporacion = async (req, res) => {
  try {
    const { desincorporacion, bienes } = req.body;
    console.log(bienes);
    console.log(desincorporacion);

    const anioActual = new Date().getFullYear().toString();

    // Consultar el número de secuencia actual para este año
    const [result] = await db.query(
      `SELECT MAX(CAST(SUBSTRING(codigo, 5) AS UNSIGNED)) as ultimoNumero
      FROM desincorporacion
      WHERE SUBSTRING(codigo, 1, 4) = ?`,
      [anioActual]
    );

    const ultimoNumero = result[0].ultimoNumero || 0;
    const nuevoNumero = ultimoNumero + 1;
    const codigoDesincorporacion = anioActual + String(nuevoNumero).padStart(2, '0');

    // Insertar la desincorporación en la tabla 'desincorporacion'
    const [insertDesincorporacion] = await db.query(
      `INSERT INTO desincorporacion (fecha_desincorporacion, causa, id_usuario, codigo) VALUES (?, ?, ?, ?)`,
      [desincorporacion.fecha_desincorporacion, desincorporacion.causa, desincorporacion.id_usuario, codigoDesincorporacion]
    );

    const idDesincorporacion = insertDesincorporacion.insertId;

    // Actualizar el id_desincorporacion en el objeto bienes
    const bienesConId = bienes.map((bien) => ({
      ...bien,
      id_desincorporacion,
    }));

    // Insertar los bienes desincorporados en la tabla 'bienes_desincorporados'
    const bienesValues = bienesConId.map((bien) => [bien.id_bien, bien.id_desincorporacion]);
    await db.query(
      `INSERT INTO bienes_desincorporados (id_bien, id_desincorporacion) VALUES ?`,
      [bienesValues]
    );

    // Actualizar el estado y la ubicación en la tabla 'ejemplar_bien'
    for (const bien of bienesConId) {
      await db.query(
        `UPDATE ejemplar_bien SET estado = ?, ubicacion = ? WHERE id_variacion = ?`,
        ["Desincorporado", bien.valor, bien.id_variacion]
      );
    }

    res.status(200).json('Desincorporacion registrada exitosamente.');
  } catch (error) {
    console.error('Error al registrar la desincorporacion:', error);
    res.status(500).json({ error: 'Error al registrar la desincorporacion.' });
  }
};


export const obtenerDesincorporaciones = async (req, res) => {
  try {
    const consulta = `SELECT
      d.id_desincorporacion,
      d.fecha_desincorporacion,
      d.causa, 
      d.estado, 
      d.codigo,
      d.id_usuario,
      CONCAT(u.nombre, ' ', u.apellido) AS nombre_completo_usuario
    FROM
      desincorporacion AS d
    JOIN
      usuario AS u ON d.id_usuario = u.id_usuario`;

    const [data] = await db.execute(consulta);
    res.status(200).json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener las desincorporaciones.' });
  }
};

export const obtenerDesincorporacionParaResumen = async (req, res) =>{
  const { id  } = req.params;
  try {
    const consulta = `SELECT
      d.id_desincorporacion,
      d.fecha_desincorporacion,
      d.causa,
      d.estado, 
      d.codigo,
      d.id_usuario,
      u.nombre AS nombre_usuario,
      u.apellido AS apellido_usuario
    FROM
      desincorporacion AS d
    JOIN
      usuario AS u ON d.id_usuario = u.id_usuario 
    WHERE d.id_desincorporacion = ?`;

    const [data] = await db.execute(consulta, [id]);
    if (data.length === 0) return res.status(404).json("Desincorporación no encontrada");
    return res.status(200).json(data[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json(error.message);
  }
};

  export const obtenerBienesDesincorporados = async (req, res) => {
    const { id } = req.params;
    try {
        const q = `SELECT
            e.id_variacion AS id_ejemplar,
            e.codigo_ejemplar AS codigo_ejemplar,
            e.ubicacion AS ubicacion,
            e.estado AS estado,
            e.valor AS valor,
            b.nombre AS nombre_bien,
            b.descripcion
        FROM
            ejemplar_bien AS e
        JOIN
            bien AS b ON e.id_bien = b.id_bien
        JOIN
            bienes_desincorporados AS bd ON e.id_variacion = bd.id_bien
        WHERE
            bd.id_desincorporacion = ?`;
        db.query(q, [id], (err, data) => {
            if (err) return res.status(500).json(err);
            if (data.length === 0) {
                return res.send({ error: "No existen bienes en esta desincorporacion" });
            }
            return res.status(200).json(data);
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al obtener los datos" });
    }
}

export const eliminarDesincorporacionPorId = async (req, res) => {
  try {
      const { id } = req.params;

      // Verificar si la desincorporación existe
      const verificarExistencia = "SELECT * FROM desincorporacion WHERE id_desincorporacion = ?";
      const [desincorporacion] = await db.execute(verificarExistencia, [id]);

      if (desincorporacion.length === 0) {
          return res.status(404).json("Desincorporacion no encontrada");
      }

      // Eliminar la desincorporación
      const eliminarDesincorporacion = "DELETE FROM desincorporacion WHERE id_desincorporacion = ?";
      await db.execute(eliminarDesincorporacion, [id]);

      return res.status(200).json("Desincorporacion eliminada correctamente");
  } catch (error) {
      console.error(error);
      res.status(500).json(error.message);
  }
}

export const bienesDesincorporadosPorFecha = async (req, res) => {
  try {
      const { fechaInicial, fechaFinal } = req.query;

      // Realiza la consulta a la base de datos
      const query = `
          SELECT 
              b.nombre AS nombre_bien,
              eb.codigo_ejemplar,
              d.fecha_desincorporacion,
              d.causa AS motivo_desincorporacion,
              eb.ubicacion
          FROM 
              bien AS b
          JOIN 
              ejemplar_bien AS eb ON b.id_bien = eb.id_bien
          JOIN 
              bienes_desincorporados AS bd ON eb.id_variacion = bd.id_bien
          JOIN 
              desincorporacion AS d ON bd.id_desincorporacion = d.id_desincorporacion
          WHERE 
              d.fecha_desincorporacion BETWEEN ? AND ?`;

      const [bienesDesincorporados] = await db.execute(query, [fechaInicial, fechaFinal]);

      if (bienesDesincorporados.length === 0) {
          return res.send({ error: "No existen bienes en esta desincorporacion" });
      } else {
          res.json({ success: true, data: bienesDesincorporados });
      }
  } catch (error) {
      console.error('Error al obtener bienes desincorporados:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
}

