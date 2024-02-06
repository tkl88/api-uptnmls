import express from "express";
import { actualizarTecnico, crearTecnico, obtenerTecnicoPorId, obtenerTodosTecnicos } from "../controllers/tecnicos.js"; 
  
const router = express.Router();

router.post("/crear-tecnico", crearTecnico);
router.put("/actualizar-tecnico/:id" , actualizarTecnico)
router.get("/obtener-tecnicos", obtenerTodosTecnicos)
router.get("/obtenerTecnico/:id", obtenerTecnicoPorId)  

  
export default router

