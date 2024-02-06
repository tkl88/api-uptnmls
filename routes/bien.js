import express from "express";
import { actualizarBien, crearBien, eliminarBien, generarCatalogo, obtenerBienPorId, obtenerBienPorRango, obtenerBienes, obtenerEjemplares, obtenerEjemplaresPorCategoria } from "../controllers/bien.js";

const router = express.Router();

router.post("/crear-bien", crearBien);
router.put("/actualizar-bien/:id_bien", actualizarBien)
router.get("/obtener-bienes", obtenerBienes)
router.get("/generar-catalogo", generarCatalogo)
router.get("/obtenerBienPorId/:id_bien", obtenerBienPorId)
router.get("/obtenerBienesPorRango", obtenerBienPorRango)
router.get("/obtener-ejemplares/:id", obtenerEjemplares)
router.get("/obtener-ejemplaresCategoria/:id", obtenerEjemplaresPorCategoria)

router.delete("/eliminar-bien/:id", eliminarBien)

  
export default router

