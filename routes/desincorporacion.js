import express from "express";
 import { bienesDesincorporadosPorFecha, crearDesincorporacion, eliminarDesincorporacionPorId, obtenerBienesDesincorporados, obtenerDesincorporacionParaResumen, obtenerDesincorporaciones } from "../controllers/desincorporacion.js";
    
const router = express.Router();

router.post("/crear-desincorporacion", crearDesincorporacion); 
router.get("/obtener-desincorporaciones", obtenerDesincorporaciones); 
router.get("/obtener-incorporacion/:id", obtenerDesincorporacionParaResumen)
router.get("/obtener-bienes/:id", obtenerBienesDesincorporados)
router.get("/bienesDesincorporadosPorFecha", bienesDesincorporadosPorFecha)

router.delete("/eliminarDesincorporacion/:id", eliminarDesincorporacionPorId)

export default router

    