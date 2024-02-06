import express from "express";
import { actualizarAsignacion, bienesAsignadosPorFecha, crearAsignacion, crearSolicitud, eliminarAsignacionPorId, estadoSolicitud, obtenerAsignacionParaResumen, obtenerAsignacionPorId, obtenerAsignacionesPorRango, obtenerAsignacionesPorRangoDeFecha, obtenerBienesAsignados, obtenerBienesSolicitados, obtenerEjemplaresParaAsignacion, obtenerSolicitudParaResumen, obtenerTodasLasAsignaciones, obtenerTodasLasSolicitudes } from "../controllers/asignacion.js";
 
const router = express.Router();

router.post("/crear-asignacion", crearAsignacion);
router.post("/crear-solicitud", crearSolicitud);
router.put("/actualizar-asignacion", actualizarAsignacion);
router.get("/obtener-asignaciones", obtenerTodasLasAsignaciones);
router.get("/obtenerAsignacionesPorId/:id", obtenerAsignacionPorId);
router.delete("/eliminar-asignacion/:id", eliminarAsignacionPorId);
router.get("/obtenerAsignacionPorRango", obtenerAsignacionesPorRangoDeFecha)
router.get("/obtener-bienes-asignacion", obtenerEjemplaresParaAsignacion)
router.get("/obtener-asignacion/:id", obtenerAsignacionParaResumen);
router.get("/bienes-asignados/:id", obtenerBienesAsignados)
router.get('/asignaciones', obtenerAsignacionesPorRango);
router.get('/solicitudes', obtenerTodasLasSolicitudes);
router.get("/obtener-solicitud/:id", obtenerSolicitudParaResumen);
router.put("/estado-solicitud/:id", estadoSolicitud);
router.get("/bienes-solicitados/:id", obtenerBienesSolicitados)
router.get("/bienesAsignadosPorFecha", bienesAsignadosPorFecha)

export default router
