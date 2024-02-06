import express from "express";
 import { eliminarMantenimiento, finalizarMantenimiento, obtenerBienesMantenimiento, obtenerMantenimientoPorRangoDeFecha, obtenerMantenimientos, obtenerMatenimientoParaResumen, obtenerTecnicos, registrarMantenimiento } from "../controllers/mantenimiento.js"; 

const router = express.Router();

 
router.get("/obtener-tecnicos", obtenerTecnicos)  
router.get("/obtener-mantenimientos", obtenerMantenimientos) 
router.get("/obtener-mantenimiento/:id", obtenerMatenimientoParaResumen) 
router.get("/obtener-bienes-mantenimiento/:id", obtenerBienesMantenimiento) 
router.post("/registrar-mantenimiento", registrarMantenimiento)
router.get("/mantenimientos", obtenerMantenimientoPorRangoDeFecha)
router.put("/finalizar-mantenimiento/:id", finalizarMantenimiento)
router.delete("/eliminarMantenimiento/:id", eliminarMantenimiento)
  
export default router

