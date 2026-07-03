import db from '../models/index.js';
import { generateToken } from '../middleware/auth.js';

const { Usuario, Estudiante, Administrador, Carrera } = db;

export const register = async (req, res) => {
  try {
    const { nombre, apellido, email, password, fechaNacimiento } = req.body;

    if (!nombre || !apellido || !email || !password) {
      return res.status(400).json({
        message: 'Nombre, apellido, email y password son obligatorios',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: 'La contraseña debe tener al menos 6 caracteres',
      });
    }

    const emailExistente = await Usuario.findOne({ where: { email } });
    if (emailExistente) {
      return res.status(409).json({
        message: `Ya existe un usuario con el email "${email}"`,
      });
    }

    const usuario = await Usuario.create({
      nombre,
      apellido,
      email,
      password,
      fechaNacimiento: fechaNacimiento || null,
    });

    await Estudiante.create({ usuarioId: usuario.id });

    const estudiante = await Estudiante.findOne({ where: { usuarioId: usuario.id } });
    const token = generateToken(usuario);

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      token,
      user: {
        id: usuario.id,
        estudianteId: estudiante?.id,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        email: usuario.email,
        rol: usuario.rol,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error al registrar el usuario',
      error: error.message,
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: 'Email y password son obligatorios',
      });
    }

    const usuario = await Usuario.findOne({ where: { email } });
    if (!usuario) {
      return res.status(401).json({
        message: 'Email o contraseña incorrectos',
      });
    }

    const passwordValido = await usuario.comparePassword(password);
    if (!passwordValido) {
      return res.status(401).json({
        message: 'Email o contraseña incorrectos',
      });
    }

    if (!usuario.activo) {
      return res.status(403).json({
        message: 'Cuenta desactivada. Contacte a un administrador.',
      });
    }

    const estudiante = await Estudiante.findOne({ where: { usuarioId: usuario.id } });
    const administrador = await Administrador.findOne({ where: { usuarioId: usuario.id } });
    const token = generateToken(usuario);

    res.json({
      message: 'Inicio de sesión exitoso',
      token,
      user: {
        id: usuario.id,
        estudianteId: estudiante?.id,
        administradorId: administrador?.id,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        email: usuario.email,
        rol: usuario.rol,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error al iniciar sesión',
      error: error.message,
    });
  }
};

export const me = async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.user.id, {
      attributes: { exclude: ['password'] },
      include: [
        { model: Estudiante, include: [Carrera] },
        { model: Administrador },
      ],
    });

    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json({ data: usuario.toJSON() });
  } catch (error) {
    res.status(500).json({
      message: 'Error al obtener el usuario',
      error: error.message,
    });
  }
};
