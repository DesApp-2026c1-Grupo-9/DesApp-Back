import { Op } from 'sequelize';
import db from '../models/index.js';
import { i18nOrder } from '../utils/sort.js';
const { Usuario, Estudiante, PreferenciasEstudiante } = db;

export const index = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sort = 'apellido',
      dir = 'asc',
      search = '',
      rol,
      activo,
    } = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit) || 10));
    const offset = (pageNum - 1) * limitNum;

    const where = {};
    if (rol) where.rol = rol;
    if (activo === 'true') where.activo = true;
    if (activo === 'false') where.activo = false;

    if (search.trim()) {
      const term = `%${search.trim()}%`;
      where[Op.or] = [
        { nombre: { [Op.iLike]: term } },
        { apellido: { [Op.iLike]: term } },
        { email: { [Op.iLike]: term } },
      ];
    }

    const sortField = sort === 'nombre' ? 'apellido' : sort;
    const stringFields = ['email', 'rol', 'apellido'];
    const order =
      sort === 'nombre'
        ? [
            i18nOrder('Usuario', 'apellido', dir),
            i18nOrder('Usuario', 'nombre', dir),
          ]
        : stringFields.includes(sortField)
        ? [i18nOrder('Usuario', sortField, dir)]
        : [[sortField, dir]];

    const { count, rows: usuarios } = await Usuario.findAndCountAll({
      where,
      include: [
        {
          model: PreferenciasEstudiante,
          as: 'preferencias',
          attributes: ['perfilPublico', 'visibleEnDescubrir'],
          required: false,
        },
      ],
      order,
      offset,
      limit: limitNum,
    });

    const data = usuarios.map((usuario) => {
      const json = usuario.toJSON();
      return {
        ...json,
        perfilPublico: json.preferencias?.perfilPublico ?? true,
        visibleEnDescubrir: json.preferencias?.visibleEnDescubrir ?? true,
      };
    });

    res.json({
      data,
      total: count,
      page: pageNum,
      pages: Math.ceil(count / limitNum),
      limit: limitNum,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error al obtener los usuarios', error: error.message });
  }
};

export const create = async (req, res) => {
  try {
    const {
      nombre,
      apellido,
      email,
      password,
      rol,
      fechaNacimiento,
      avatarUrl,
    } = req.body;

    if (!nombre || !apellido || !email || !password) {
      return res.status(400).json({
        message: 'Nombre, apellido, email y password son obligatorios',
      });
    }

    const emailExistente = await Usuario.findOne({ where: { email } });
    if (emailExistente) {
      return res.status(409).json({
        message: `Ya existe un usuario con el email "${email}"`,
      });
    }

    const rolesValidos = ['estudiante', 'administrador'];
    const rolFinal = rol && rolesValidos.includes(rol) ? rol : 'estudiante';

    const usuario = await Usuario.create({
      nombre,
      apellido,
      email,
      password,
      rol: rolFinal,
      fechaNacimiento: fechaNacimiento || null,
      avatarUrl: avatarUrl || null,
    });

    // Si es estudiante, crear el registro en la tabla Estudiantes
    if (rolFinal === 'estudiante') {
      await Estudiante.create({ usuarioId: usuario.id });
    }

    res.status(201).json({
      message: 'Usuario creado exitosamente',
      data: {
        id: usuario.id,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        email: usuario.email,
        rol: usuario.rol,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error al crear el usuario',
      error: error.message,
    });
  }
};

export const update = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nombre,
      apellido,
      email,
      password,
      rol,
      fechaNacimiento,
      avatarUrl,
      activo,
      genero,
    } = req.body;

    const usuario = await Usuario.findByPk(id);
    if (!usuario) {
      return res.status(404).json({
        message: `No se encontró un usuario con id ${id}`,
      });
    }

    if (email && email !== usuario.email) {
      const emailExistente = await Usuario.findOne({ where: { email } });
      if (emailExistente) {
        return res.status(409).json({
          message: `Ya existe un usuario con el email "${email}"`,
        });
      }
    }

    const updateData = {};
    if (nombre) updateData.nombre = nombre;
    if (apellido) updateData.apellido = apellido;
    if (email) updateData.email = email;
    if (password) updateData.password = password;
    if (rol) updateData.rol = rol;
    if (fechaNacimiento !== undefined)
      updateData.fechaNacimiento = fechaNacimiento;
    if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl;
    if (activo !== undefined) updateData.activo = activo;
    if (genero !== undefined) updateData.genero = genero;

    await usuario.update(updateData);

    res.json({
      message: 'Usuario actualizado exitosamente',
      data: {
        id: usuario.id,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        email: usuario.email,
        rol: usuario.rol,
        activo: usuario.activo,
        genero: usuario.genero,
        fechaNacimiento: usuario.fechaNacimiento,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error al actualizar el usuario',
      error: error.message,
    });
  }
};

export const remove = async (req, res) => {
  try {
    const { id } = req.params;

    const usuario = await Usuario.findByPk(id);
    if (!usuario) {
      return res.status(404).json({
        message: `No se encontró un usuario con id ${id}`,
      });
    }

    // Si es estudiante, eliminar su registro en Estudiantes
    if (usuario.rol === 'estudiante') {
      await Estudiante.destroy({ where: { usuarioId: id } });
    }

    await usuario.destroy();

    res.json({
      message: 'Usuario eliminado exitosamente',
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error al eliminar el usuario',
      error: error.message,
    });
  }
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
