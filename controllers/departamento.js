import { db } from "../conexion.js";


export const registrarDepartamento = async (req, res) => {
  try {
      const { nombre, descripcion, ubicacion } = req.body;

      // Verificar si ya existe un departamento con ese nombre
      const existente = await db.execute("SELECT * FROM departamento WHERE nombre = ?", [nombre]);
      if (existente[0].length > 0) {
          return res.status(409).json("Existe un departamento con ese nombre");
      }

      // Insertar datos del departamento
      const insertarDatos = "INSERT INTO departamento (nombre, descripcion, ubicacion) VALUES (?, ?, ?)";
      await db.execute(insertarDatos, [nombre, descripcion, ubicacion]);

      return res.status(200).json("Departamento registrado correctamente");
  } catch (error) {
      console.error(error);
      res.status(500).json(error.message);
  }
};

export const actualizarDepartamento = async (req, res) => {
  try {
      const { nombre, descripcion, ubicacion } = req.body;
      const { id } = req.params;

      // Verificar si el departamento existe
      const existente = await db.execute("SELECT * FROM departamento WHERE id_departamento = ?", [id]);
      if (existente[0].length === 0) {
          return res.status(404).json("El departamento no existe");
      }

      // Actualizar el departamento
      const actualizarDatos = "UPDATE departamento SET nombre = ?, descripcion = ?, ubicacion = ? WHERE id_departamento = ?";
      await db.execute(actualizarDatos, [nombre, descripcion, ubicacion, id]);

      return res.status(200).json("Departamento actualizado correctamente");
  } catch (error) {
      console.error(error);
      res.status(500).json(error.message);
  }
};



export const obtenerTodosLosDepartamentos = async (req, res) => {
  try {
    const consulta = "SELECT * FROM departamento";
    const [data] = await db.execute(consulta);
    return res.status(200).json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json(error.message);
  }
};

export const obtenerBienesAsignados = async (req, res) => {
  const { id } = req.params;
  try {
    const consulta = `SELECT
      ba.id_bienes_asinados,
      b.nombre AS nombre_bien,
      b.descripcion AS descripcion_bien,
      eb.codigo_ejemplar,
      eb.ubicacion AS ubicacion_ejemplar,
      eb.estado AS estado_ejemplar,
      eb.valor AS valor_ejemplar,
      ba.vigencia,
      d.nombre AS nombre_departamento
    FROM
      bienes_asignados ba
    JOIN
      ejemplar_bien eb ON ba.id_ejemplar_bien = eb.id_variacion
    JOIN
      bien b ON eb.id_bien = b.id_bien
    JOIN
      asignacion a ON ba.id_asignacion = a.id_asignacion
    JOIN
      departamento d ON a.departamento_id = d.id_departamento
    WHERE
      d.id_departamento = ?`;

    const [data] = await db.execute(consulta, [id]);

    if (data.length === 0) {
      return res.status(404).json("Departamento no encontrado");
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error(error);
    return res.status(500).json(error.message);
  }
};


export const obtenerDepartamentoPorId = async (req, res) => {
  const { id } = req.params;
  try {
    const consulta = "SELECT * FROM departamento WHERE id_departamento = ?";
    const [data] = await db.execute(consulta, [id]);
    
    if (data.length === 0) {
      return res.status(404).json("Departamento no encontrado");
    }
    
    return res.status(200).json(data[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json(error.message);
  }
};

export const obtenerBienesDeDepartamento = async (req, res) => {
  const { id } = req.params;
  try {
    const consulta = `SELECT
      ea.id_bienes_asinados,
      eb.id_variacion,
      b.nombre AS nombre_bien,
      eb.codigo_ejemplar,
      eb.ubicacion,
      eb.estado,
      eb.valor
    FROM bienes_asignados ea
    JOIN ejemplar_bien eb ON ea.id_ejemplar_bien = eb.id_variacion
    JOIN bien b ON eb.id_bien = b.id_bien
    JOIN asignacion a ON ea.id_asignacion = a.id_asignacion
    JOIN departamento d ON a.departamento_id = d.id_departamento
    WHERE d.id_departamento = ?`;

    const [data] = await db.execute(consulta, [id]);

    if (data.length === 0) {
      return res.status(404).json("Este departamento no tiene bienes");
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json(error.message);
  } 
};

export const eliminarDepartamentoPorId = async (req, res) => {
  const { id } = req.params;
  try {
    const verificarExistencia = "SELECT * FROM departamento WHERE id_departamento = ?";
    const [data] = await db.execute(verificarExistencia, [id]);
    if (data.length === 0) {
      return res.status(404).json("Departamento no encontrado");
    }

    const eliminarDepartamento = "DELETE FROM departamento WHERE id_departamento = ?";
    await db.execute(eliminarDepartamento, [id]);
    return res.status(200).json("Departamento eliminado correctamente");
  } catch (error) {
    console.error(error);
    res.status(500).json(error.message);
  }
};

export const obtenerBieness = async (req, res) => {
  const id = req.params.id;
  try {
    const q = `SELECT 
      ba.id_bienes_asinados,
      eb.codigo_ejemplar,
      eb.ubicacion,
      eb.estado,
      eb.valor,
      eb.id_incorporacion,
      b.nombre AS nombre_bien,
      b.descripcion AS descripcion_bien
    FROM bienes_asignados ba
    JOIN ejemplar_bien eb ON ba.id_ejemplar_bien = eb.id_variacion
    JOIN asignacion a ON ba.id_asignacion = a.id_asignacion
    JOIN bien b ON eb.id_bien = b.id_bien
    WHERE a.departamento_id = ?`;

    const [data] = await db.execute(q, [id]);

    if (data.length === 0) {
      return res.send({ error: "No existen bienes en este Departamento" });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener los datos" });
  }
};