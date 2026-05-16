import db from '../models/index.js';
const {
  Usuario,
  Estudiante,
  Carrera,
  Materia,
  PlanDeEstudio,
  PlanMateria,
  Correlatividades,
  Sesion,
  PreferenciasEstudiante,
} = db;

// In-memory storage for estados
const estadosEstudiantes = new Map();

export const index = async (req, res) => {
  const { rol } = req.query;
  const where = {};
  if (rol) where.rol = rol;

  const usuarios = await Usuario.findAll({
    where,
    include: [{
      model: PreferenciasEstudiante,
      as: 'preferencias',
      attributes: ['perfilPublico'],
      required: false
    }]
  });

  const data = usuarios.map((usuario) => {
    const json = usuario.toJSON();
    return {
      ...json,
      perfilPublico: json.preferencias?.perfilPublico ?? true
    };
  });

  res.json({ data });
};

export const getAllEstudiantes = async (req, res) => {
  try {
    const estudiantes = await Estudiante.findAll({
      include: [
        {
          model: Usuario,
          attributes: ['id', 'usuario', 'nombre', 'apellido', 'avatarUrl'],
        },
        {
          model: Carrera,
          through: { attributes: [] }, // No incluir campos de la tabla intermedia
          attributes: ['id', 'nombre'],
        },
      ],
    });

    res.json({ data: estudiantes.map((estudiante) => estudiante.toJSON()) });
  } catch (error) {
    console.error('Error al obtener estudiantes:', error);
    res
      .status(500)
      .json({ message: 'Error interno del servidor', error: error.message });
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

    if (!nombre || !apellido || !email) {
      return res.status(400).json({
        message: 'Nombre, apellido y email son obligatorios',
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
      password: password || 'sincontraseña',
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

    // Eliminar sesiones creadas por el usuario
    await Sesion.destroy({ where: { creadorId: id } });

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

export const updateEstadoMateria = async (req, res) => {
  try {
    const { id: estudianteId, materiaId } = req.params;
    const { estado } = req.body;

    // Validar que el estado sea válido
    const estadosValidos = ['no_cursada', 'cursando', 'aprobada'];
    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({
        message: 'Estado inválido',
        estadosValidos,
      });
    }

    // Verificar que el estudiante existe
    const estudiante = await Estudiante.findByPk(estudianteId);
    if (!estudiante) {
      return res.status(404).json({ message: 'Estudiante no encontrado' });
    }

    // Verificar que la materia existe
    const materia = await Materia.findByPk(materiaId);
    if (!materia) {
      return res.status(404).json({ message: 'Materia no encontrada' });
    }

    // Si se está intentando aprobar la materia, validar prerrequisitos
    if (estado === 'aprobada') {
      const prerequisitosIncumplidos = await validarPrerrequisitos(
        estudianteId,
        materiaId
      );
      if (prerequisitosIncumplidos.length > 0) {
        return res.status(400).json({
          message:
            'No se puede aprobar la materia. Prerrequisitos no cumplidos.',
          prerequisitosIncumplidos: prerequisitosIncumplidos.map(
            (p) => p.nombre
          ),
        });
      }
    }

    // Actualizar estado en memoria
    const key = `${estudianteId}-${materiaId}`;
    estadosEstudiantes.set(key, estado);

    res.json({
      message: 'Estado de materia actualizado exitosamente',
      estudianteId,
      materiaId,
      nuevoEstado: estado,
    });
  } catch (error) {
    console.error('Error al actualizar estado de materia:', error);
    res
      .status(500)
      .json({ message: 'Error interno del servidor', error: error.message });
  }
};

export const getPlanMaterias = async (req, res) => {
  try {
    const estudianteId = req.params.id;

    console.log(`Buscando plan de materias para estudiante ${estudianteId}`);

    const estudiante = await Estudiante.findByPk(estudianteId, {
      include: [
        {
          model: Usuario,
          attributes: ['id', 'usuario', 'nombre', 'apellido'],
        },
        {
          model: Carrera,
          through: { attributes: [] },
          include: [
            {
              model: PlanDeEstudio,
              include: [
                {
                  model: Materia,
                  through: {
                    model: PlanMateria,
                    attributes: ['anio', 'cuatrimestre'],
                  },
                  include: [
                    {
                      model: Correlatividades,
                      as: 'prerrequisitos',
                      include: [
                        {
                          model: Materia,
                          as: 'prerrequisito',
                          attributes: ['id', 'nombre'],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    });

    if (!estudiante) {
      return res.status(404).json({ message: 'Estudiante no encontrado' });
    }

    console.log(
      `Estudiante ${estudianteId} encontrado, buscando carrera y materias...`
    );
    console.log(`Carreras del estudiante: ${estudiante.Carreras.length}`);

    if (!estudiante.Carreras || estudiante.Carreras.length === 0) {
      return res.status(400).json({
        message: 'El estudiante no tiene una carrera asociada',
        estudianteId: estudianteId,
      });
    }

    // Obtener materias con estados
    const carrera = estudiante.Carreras[0];

    if (!carrera.PlanDeEstudios || carrera.PlanDeEstudios.length === 0) {
      return res.status(400).json({
        message: 'La carrera no tiene un plan de estudios asociado',
        carrera: carrera.nombre,
      });
    }

    const planDeEstudio = carrera.PlanDeEstudios[0];

    const materiasConEstado = planDeEstudio.Materias.map((materia) => {
      const key = `${estudianteId}-${materia.id}`;
      const estado = estadosEstudiantes.get(key) || 'no_cursada';

      return {
        ...materia.toJSON(),
        estado,
        correlatividades: materia.prerrequisitos.map((correlatividad) => ({
          id: correlatividad.prerrequisito.id,
          nombre: correlatividad.prerrequisito.nombre,
        })),
      };
    });

    res.json({
      estudiante: {
        id: estudiante.id,
        usuario: estudiante.Usuario.usuario,
        nombre: estudiante.Usuario.nombre,
        apellido: estudiante.Usuario.apellido,
        carrera: carrera.nombre,
      },
      materias: materiasConEstado,
    });
  } catch (error) {
    console.error('Error al obtener plan de materias:', error);
    res
      .status(500)
      .json({ message: 'Error interno del servidor', error: error.message });
  }
};

// Función auxiliar para validar prerrequisitos
const validarPrerrequisitos = async (estudianteId, materiaId) => {
  try {
    // Obtener todos los prerrequisitos de la materia
    const prerrequisitos = await Correlatividades.findAll({
      where: { materiaId },
      include: [
        {
          model: Materia,
          as: 'prerrequisito',
          attributes: ['id', 'nombre'],
        },
      ],
    });

    const prerequisitosIncumplidos = [];

    // Verificar cada prerrequisito
    for (const correlatividad of prerrequisitos) {
      const prereqId = correlatividad.prerrequisitoId;
      const key = `${estudianteId}-${prereqId}`;
      const estadoPrerreq = estadosEstudiantes.get(key) || 'no_cursada';

      // El prerrequisito debe estar al menos cursando o aprobado
      if (estadoPrerreq === 'no_cursada') {
        prerequisitosIncumplidos.push(correlatividad.prerrequisito);
      }
    }

    return prerequisitosIncumplidos;
  } catch (error) {
    console.error('Error al validar prerrequisitos:', error);
    throw error;
  }
};
