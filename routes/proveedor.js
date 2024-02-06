import express from "express";
import { actualizarProveedor, crearProveedor, eliminarProveedor, obtenerProveedorPorId, obtenerProveedores } from "../controllers/proveedor.js";
 
const router = express.Router();

router.post("/crear-proveedor", crearProveedor);
router.put("/actualizar-proveedor/:id_proveedor", actualizarProveedor)
router.get("/obtener-proveedores", obtenerProveedores)
router.get("/obtenerProveedorPorId/:id_proveedor", obtenerProveedorPorId) 
router.delete("/eliminar-proveedor/:id_proveedor", eliminarProveedor)

  
export default router

