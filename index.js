import express from "express";
import dotenv from "dotenv"
import cors from "cors";
import morgan from "morgan";
import bienRoutes from "./routes/bien.js" 
import usuarioRoutes from "./routes/usuario.js"
import departamentosRoutes from "./routes/departamento.js"
import asignacionRoutes from "./routes/asignacion.js"
import categoriaRoutes from "./routes/categoria.js"
import proveedoresRoutes from "./routes/proveedor.js"
import incorporacionRoutes from "./routes/incorporacion.js"
import trasnferenciasRoutes from "./routes/transferencia.js"
import mantenimientoRoutes from "./routes/mantenimiento.js"
import desincorporacionoRoutes from "./routes/desincorporacion.js"
import tecnicoRoutes from "./routes/tecnico.js"
//CONFIGURACION ENV
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.use("/api/bien", bienRoutes)
app.use("/api/usuario", usuarioRoutes)
app.use("/api/departamento", departamentosRoutes)
app.use("/api/asignacion", asignacionRoutes)
app.use("/api/categoria", categoriaRoutes)
app.use("/api/proveedor", proveedoresRoutes)
app.use("/api/incorporacion", incorporacionRoutes)
app.use("/api/transferencia", trasnferenciasRoutes)
app.use("/api/mantenimiento", mantenimientoRoutes)
app.use("/api/desincorporacion", desincorporacionoRoutes)
app.use("/api/tecnico", tecnicoRoutes)
app.listen(8800,()=>{
    console.log("Api marchando");
    
})