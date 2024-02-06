import express from "express";
import { crearIncorporacion, eliminarIncorporacion, obtenerBienesIncorporacion, obtenerIncorporacion, obtenerIncorporaciones,    obtenerIncorporacionesPorRangoDeFechaPdf  } from "../controllers/incorporacion.js";
 
const router = express.Router();

router.post("/crear-incorporacion", crearIncorporacion);  
router.get("/obtener-incorporaciones", obtenerIncorporaciones);  
router.get("/obtener-incorporacion/:id", obtenerIncorporacion)
router.get("/bienes-incorporados/:id", obtenerBienesIncorporacion)
router.get('/incorporaciones', obtenerIncorporaciones);
router.get('/consultarBinesPorRango', obtenerIncorporacionesPorRangoDeFechaPdf)

router.delete("/eliminar-incorporacion/:id", eliminarIncorporacion)
  
export default router

