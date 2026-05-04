import db from '../models/index.js';
const {
  Usuario,
  Estudiante,
  Carrera,
  Materia,
  PlanDeEstudio,
  PlanMateria,
  Correlatividades,
} = db;

// In-memory storage for estados
const estadosEstudiantes = new Map();

export const index = async (req, res) => {
  const usuarios = await Usuario.findAll({});
  res.json({ data: usuarios.map((usuario) => usuario.toJSON()) });
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

    if (!carrera.PlanesDeEstudio || carrera.PlanesDeEstudio.length === 0) {
      return res.status(400).json({
        message: 'La carrera no tiene un plan de estudios asociado',
        carrera: carrera.nombre,
      });
    }

    const planDeEstudio = carrera.PlanesDeEstudio[0];

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
