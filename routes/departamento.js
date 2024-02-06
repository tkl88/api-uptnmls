import express from "express";
import { actualizarDepartamento, eliminarDepartamentoPorId, obtenerBienesAsignados, obtenerBienesDeDepartamento, obtenerBieness, obtenerDepartamentoPorId, obtenerTodosLosDepartamentos, registrarDepartamento } from "../controllers/departamento.js";
 


const router = express.Router();

router.post("/crear-departamento", registrarDepartamento);
router.put("/actualizar-departamento/:id", actualizarDepartamento);
router.get("/traer-departamentos", obtenerTodosLosDepartamentos);
router.get("/traerDepartamento/:id", obtenerDepartamentoPorId)
router.get("/bienes-asignados/:id", obtenerBienesAsignados)
router.get("/obtener-bienes-departamento/:id", obtenerBienesDeDepartamento)
router.get("/obtener-bienes-asignados/:id", obtenerBieness)
router.delete("/eliminarDepartamento/:id", eliminarDepartamentoPorId)


export default router; 