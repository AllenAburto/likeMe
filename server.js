import express from "express";
import cors from "cors";
import { pool } from "./database.js";
import Joi from "joi";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const postSchema = Joi.object({
  titulo: Joi.string().required(),
  img: Joi.string().required(),
  descripcion: Joi.string().required(),
});

app.get("/posts", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM posts");
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener los posts" });
  }
});

app.post("/posts", async (req, res) => {
  const { error, value } = postSchema.validate(req.body);

  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  const { titulo, img, descripcion } = value;

  try {
    const query =
      "INSERT INTO posts (titulo, img, descripcion, likes) VALUES ($1, $2, $3, 0) RETURNING *";
    const values = [titulo, img, descripcion];

    const { rows } = await pool.query(query, values);
    res.status(201).json(rows[0]); 
    } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al crear el post" });
  }
});

app.put("/posts/:id/like", async (req, res) => {
  const { id } = req.params;

  try {
     const query = "UPDATE posts SET likes = likes + 1 WHERE id = $1 RETURNING *";
    const { rows } = await pool.query(query, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "Post no encontrado" });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al actualizar los likes" });
  }
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Ocurrió un error en el servidor" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor en http://localhost:${PORT}`));