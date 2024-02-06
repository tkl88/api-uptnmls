import express from "express";
import { actualizarCategoria, crearCategoria, eliminarCategoria, obtenerCategoriaPorId, obtenerCategorias } from "../controllers/categoria.js";
 
const router = express.Router();

router.post("/crear-categoria", crearCategoria); 
router.get("/obtener-categorias", obtenerCategorias)
router.get("/obtener-categoria/:codigo", obtenerCategoriaPorId)
router.put("/actualizar-categoria/:codigo", actualizarCategoria)
router.delete("/eliminar-categoria/:codigo", eliminarCategoria)


export default router

