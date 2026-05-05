import db from '../models/index.js';
const { Usuario } = db;

export const index = async (req, res) => {
  const { rol } = req.query;
  const where = {};
  if (rol) where.rol = rol;

  const usuarios = await Usuario.findAll({ where });
  res.json({ data: usuarios.map((usuario) => usuario.toJSON()) });
};

export const show = async (req, res) => {
  const usuario = await Usuario.findByPk(req.params.id);
  if (usuario) {
    res.json({ data: usuario.toJSON() });
  } else {
    res
      .status(404)
      .json({ message: `No se encontró un usuario con id ${req.params.id}` });
  }
};
