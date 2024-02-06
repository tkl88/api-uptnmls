import {db} from "../conexion.js";
import  JWT   from "jsonwebtoken";
import bcrypt from "bcryptjs"
import { requireSignIn } from "../middleware/authMiddleware.js";

export const crearUsuario = async (req, res) => {
  try {
      const { nombre, apellido, email, clave, rol } = req.body;

      // VALIDAR CAMPOS DEL FORMULARIO
      if (!nombre || !apellido || !clave || !email) {
          return res.status(400).json({ message: "Todos los campos son requeridos" });
      }

      // CONSULTAR SI EL USUARIO EXISTE
      const [usuarios] = await db.execute("SELECT * FROM usuario WHERE email = ?", [email]);
      if (usuarios.length > 0) {
          return res.status(409).json("Este usuario ya se encuentra registrado");
      }

      // ENCRIPTAR CLAVE
      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync(clave, salt);

      // CREAR USUARIO
      const estadoUsuario = "activo";
      const query = "INSERT INTO usuario (`nombre`, `apellido`, `email`, `clave`, `rol`, `estado`) VALUES (?, ?, ?, ?, ?, ?)";
      const values = [nombre, apellido, email, hashedPassword, rol, estadoUsuario];
      await db.execute(query, values);

      return res.status(201).json("Usuario creado correctamente");
  } catch (error) {
      console.error(error);
      return res.status(500).json("Error inesperado");
  }
};

export const actualizarUsuario = async (req, res) => {
  try {
      const { nombre, apellido, email, rol, estado } = req.body;
      const { id } = req.params;

      // CONSULTAR SI EL USUARIO EXISTE
      const [usuarios] = await db.execute("SELECT * FROM usuario WHERE id_usuario = ?", [id]);
      if (usuarios.length === 0) {
          return res.status(404).json("Este usuario no se encuentra registrado");
      }

      // ACTUALIZAR USUARIO
      const query = "UPDATE usuario SET nombre = ?, apellido = ?, email = ?, rol = ?, estado = ? WHERE id_usuario = ?";
      const values = [
          nombre || usuarios[0].nombre,
          apellido || usuarios[0].apellido,
          email || usuarios[0].email,
          rol || usuarios[0].rol,
          estado || usuarios[0].estado,   
          id
      ];
      await db.execute(query, values);

      return res.status(200).json("Usuario actualizado correctamente");
  } catch (error) {
      console.error(error);
      return res.status(500).json("Error inesperado");
  }
};

export const iniciarSesion = async (req, res) => {
  try {
      // CONSULTAR SI EL USUARIO YA EXISTE
      const [usuarios] = await db.execute("SELECT * FROM usuario WHERE email = ? AND estado = 'activo'", [req.body.email]);
      if (usuarios.length === 0) {
          return res.status(404).json("Usuario o contraseña incorrecta");
      }

      // COMPARAR CONTRASEÑAS
      const checkPassword = bcrypt.compareSync(req.body.clave, usuarios[0].clave);
      if (!checkPassword) {
          return res.status(400).json("Usuario o contraseña incorrecta");
      }

      // Enviar la información del usuario en la respuesta
      const usuarioInfo = {
          id_usuario: usuarios[0].id_usuario,
          nombre: usuarios[0].nombre,
          apellido: usuarios[0].apellido,
          email: usuarios[0].email,
          rol: usuarios[0].rol
      };

      // GENERAR TOKEN
      const token = JWT.sign({ id_usuario: usuarios[0].id_usuario }, process.env.JWT_SECRET, { expiresIn: "30d" });

      return res.status(200).json({
          success: true,
          message: "Inicio de sesión",
          user: usuarioInfo,
          token
      });
  } catch (error) {
      console.error(error);
      return res.status(500).json({ success: false, message: "Error in login", error });
  }
};
export const obtenerTodosLosUsuarios = async (req, res) => {
  try {
    const consulta = "SELECT * FROM usuario";
    const [rows, fields] = await db.query(consulta);
    res.status(200).json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json(error.message);
  }
};

export const obtenerUsuarioPorId = async (req, res) => {
  const { id } = req.params;
  try {
    const consulta = "SELECT * FROM usuario WHERE id_usuario = ?";
    const [rows, fields] = await db.query(consulta, [id]);
    if (rows.length === 0) return res.status(404).json("Usuario no encontrado");
    res.status(200).json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json(error.message);
  }
};

export const eliminarUsuarioPorId = async (req, res) => {
  const { id } = req.params;
  try {
    // Verificar si el usuario existe
    const verificarExistencia = "SELECT * FROM usuario WHERE id_usuario = ?";
    const [rows, fields] = await db.query(verificarExistencia, [id]);
    if (rows.length === 0) return res.status(404).json("Usuario no encontrado");

    // Eliminar el usuario
    const eliminarUsuario = "DELETE FROM usuario WHERE id_usuario = ?";
    await db.query(eliminarUsuario, [id]);
    res.status(200).json("Usuario eliminado correctamente");
  } catch (error) {
    console.error(error);
    res.status(500).json(error.message);
  }
};
