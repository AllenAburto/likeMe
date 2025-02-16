import { useState, useEffect } from "react";
import { FaHeart } from "react-icons/fa";
import "./App.css";


const API_URL = "http://localhost:3000/posts";

function App() {
  const [posts, setPosts] = useState([]);
  const [titulo, setTitulo] = useState("");
  const [img, setImg] = useState("");
  const [descripcion, setDescripcion] = useState("");

  useEffect(() => {
    fetch(API_URL)
      .then((res) => res.json())
      .then((data) => setPosts(data))
      .catch((error) => console.error("Error al obtener posts:", error));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!titulo || !img || !descripcion) {
      alert("Todos los campos son obligatorios");
      return;
    }

    const nuevoPost = { titulo, img, descripcion };

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nuevoPost),
      });

      if (!res.ok) throw new Error("Error al crear el post");

      const data = await res.json();
      setPosts([data, ...posts]);
      setTitulo("");
      setImg("");
      setDescripcion("");
    } catch (error) {
      console.error("Error en la solicitud POST:", error);
    }
  };

  const handleLike = async (postId) => {
    try {
      const res = await fetch(`${API_URL}/${postId}/like`, { method: "PUT" });

      if (!res.ok) throw new Error("Error al actualizar los likes");

      const updatedPost = await res.json();
      setPosts(posts.map((post) => (post.id === postId ? { ...post, likes: updatedPost.likes } : post)));
    } catch (error) {
      console.error("Error al hacer like:", error);
    }
  };

  return (
    <div className="container">
      <h1>Registra Tu Post</h1>

      <form onSubmit={handleSubmit} className="form">
        <input type="text" placeholder="Título" value={titulo} onChange={(e) => setTitulo(e.target.value)} required />
        <input type="text" placeholder="URL de imagen" value={img} onChange={(e) => setImg(e.target.value)} required />
        <textarea placeholder="Descripción" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} required />
        <button type="submit">Publicar Post</button>
      </form>

      <h2>Posts Registrados</h2>

      <div className="post-grid">
        {posts.length === 0 ? (
          <p>Sin Post Registrados</p>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="post-card">
              <img src={post.img} alt={post.titulo} className="post-img" />
              <h3>{post.titulo}</h3>
              <p>{post.descripcion}</p>
              
              <div className="like-container" onClick={() => handleLike(post.id)}>
                <FaHeart className="heart-icon" />
                <span className="like-count">{post.likes}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default App;