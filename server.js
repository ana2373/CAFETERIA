const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const app = express();
const db = new sqlite3.Database("database.db");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Crear tablas si no existen
db.serialize(() => {
  db.run("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, username TEXT, password TEXT)");
  db.run("CREATE TABLE IF NOT EXISTS menu (id INTEGER PRIMARY KEY, nombre TEXT, precio REAL, promocion INTEGER)");
  db.run("CREATE TABLE IF NOT EXISTS baristas (id INTEGER PRIMARY KEY, nombre TEXT)");
  db.run("CREATE TABLE IF NOT EXISTS ventas (id INTEGER PRIMARY KEY, producto TEXT, cantidad INTEGER, total REAL)");
});

// ---- AUTENTICACIÓN ----
app.post("/api/register", (req, res) => {
  const { username, password } = req.body;
  db.run("INSERT INTO users (username,password) VALUES (?,?)", [username, password], function(err) {
    if (err) return res.status(500).send(err.message);
    res.sendStatus(200);
  });
});

app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  db.get("SELECT * FROM users WHERE username=? AND password=?", [username, password], (err, row) => {
    if (err) return res.status(500).send(err.message);
    if (!row) return res.status(401).send("Usuario o contraseña incorrectos");
    res.json({ logged: true });
  });
});

app.delete("/api/users/:id", (req, res) => {
  db.run("DELETE FROM users WHERE id=?", [req.params.id], function(err) {
    if (err) return res.status(500).send(err.message);
    res.sendStatus(200);
  });
});

// ---- MENÚ ----
app.get("/api/menu", (req, res) => {
  db.all("SELECT * FROM menu", [], (err, rows) => res.json(rows));
});
app.post("/api/menu", (req, res) => {
  const { nombre, precio, promocion } = req.body;
  db.run("INSERT INTO menu (nombre,precio,promocion) VALUES (?,?,?)", [nombre, precio, promocion], function(err) {
    if (err) return res.status(500).send(err.message);
    res.sendStatus(200);
  });
});
app.put("/api/menu/:id", (req, res) => {
  const { nombre, precio, promocion } = req.body;
  db.run("UPDATE menu SET nombre=?, precio=?, promocion=? WHERE id=?", [nombre, precio, promocion, req.params.id], function(err) {
    if (err) return res.status(500).send(err.message);
    res.sendStatus(200);
  });
});
app.delete("/api/menu/:id", (req, res) => {
  db.run("DELETE FROM menu WHERE id=?", [req.params.id], function(err) {
    if (err) return res.status(500).send(err.message);
    res.sendStatus(200);
  });
});

// ---- BARISTAS ----
app.get("/api/baristas", (req, res) => {
  db.all("SELECT * FROM baristas", [], (err, rows) => res.json(rows));
});
app.post("/api/baristas", (req, res) => {
  const { nombre } = req.body;
  db.run("INSERT INTO baristas (nombre) VALUES (?)", [nombre], function(err) {
    if (err) return res.status(500).send(err.message);
    res.sendStatus(200);
  });
});
app.put("/api/baristas/:id", (req, res) => {
  const { nombre } = req.body;
  db.run("UPDATE baristas SET nombre=? WHERE id=?", [nombre, req.params.id], function(err) {
    if (err) return res.status(500).send(err.message);
    res.sendStatus(200);
  });
});
app.delete("/api/baristas/:id", (req, res) => {
  db.run("DELETE FROM baristas WHERE id=?", [req.params.id], function(err) {
    if (err) return res.status(500).send(err.message);
    res.sendStatus(200);
  });
});

// ---- VENTAS ----
app.get("/api/ventas", (req, res) => {
  db.all("SELECT * FROM ventas", [], (err, rows) => res.json(rows));
});

app.listen(3000, () => console.log("Servidor en http://localhost:3000"));
