import express from "express";
import { bienesTransferidosPorFecha, crearTransferencia, eliminarTransferenciaPorId, obtenerTransferenciaParaResumen, obtenerTransferenciaPorRangoDeFecha, obtenerTransferencias, obtenerTransferidos } from "../controllers/transferencia.js";
   
const router = express.Router();

router.post("/crear-transferencia", crearTransferencia);
router.get("/obtener-transferencias", obtenerTransferencias);  
router.get("/resumen-transferencia/:id", obtenerTransferenciaParaResumen);  
router.delete("/eliminar-transferencia/:id", eliminarTransferenciaPorId);
router.get("/obtener-bienes-transferidos/:id", obtenerTransferidos)
router.get("/transferencias", obtenerTransferenciaPorRangoDeFecha)
router.get("/bienesTransferidosPorFecha", bienesTransferidosPorFecha)
export default router

