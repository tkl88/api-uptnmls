import express from "express";
import { actualizarUsuario, crearUsuario, eliminarUsuarioPorId, iniciarSesion, obtenerTodosLosUsuarios, obtenerUsuarioPorId } from "../controllers/usuario.js"; 
import { requireSignIn } from "../middleware/authMiddleware.js";
 
const router = express.Router();

router.post("/crear-usuario", crearUsuario); 
router.put("/actualizar-usuario/:id", actualizarUsuario)
router.post("/iniciar-sesion", iniciarSesion)
router.get("/traer-usuarios", obtenerTodosLosUsuarios);
router.get("/traerUsuario/:id", obtenerUsuarioPorId)
router.delete("/eliminarUsuario/:id", eliminarUsuarioPorId)
//PROTEGER RUTA
router.get("/usuario-auth", requireSignIn, (req, res) => {
    res.status(200).send({ ok: true });
  });

export default router