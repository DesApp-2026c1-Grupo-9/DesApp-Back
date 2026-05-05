import db from '../models/index.js';
const { Estudiante, Usuario, Carrera, PlanDeEstudio } = db;

// Función temporal para debuggear el problema
export const getPlanMateriasDebug = async (req, res) => {
  try {
    const { estudianteId } = req.params;

    console.log(`=== DEBUG: Buscando estudiante ${estudianteId} ===`);

    // Paso 1: Verificar que el estudiante existe
    const estudianteBasico = await Estudiante.findByPk(estudianteId);
    console.log(
      'Estudiante básico:',
      estudianteBasico ? 'ENCONTRADO' : 'NO ENCONTRADO'
    );

    if (!estudianteBasico) {
      return res.status(404).json({
        message: `Estudiante ${estudianteId} no encontrado`,
      });
    }

    // Paso 2: Verificar si tiene Usuario asociado
    const estudianteConUsuario = await Estudiante.findByPk(estudianteId, {
      include: [{ model: Usuario, attributes: ['nombre', 'apellido'] }],
    });
    console.log(
      'Usuario asociado:',
      estudianteConUsuario?.Usuario ? 'SÍ' : 'NO'
    );

    // Paso 3: Verificar si tiene Carreras asociadas
    const estudianteConCarreras = await Estudiante.findByPk(estudianteId, {
      include: [{ model: Carrera, through: { attributes: [] } }],
    });
    console.log(
      'Carreras asociadas:',
      estudianteConCarreras?.Carreras?.length || 0
    );

    // Paso 4: Si tiene carreras, verificar planes de estudio
    if (estudianteConCarreras?.Carreras?.length > 0) {
      const carrera = estudianteConCarreras.Carreras[0];
      console.log('Primera carrera:', carrera.nombre);

      // Buscar planes de estudio para esta carrera
      const planesDeEstudio = await PlanDeEstudio.findAll({
        where: { carreraId: carrera.id },
        attributes: ['id', 'nombre', 'estado'],
      });
      console.log('Planes de estudio disponibles:', planesDeEstudio.length);
      planesDeEstudio.forEach((plan) => {
        console.log(`  - Plan ${plan.id}: ${plan.nombre} (${plan.estado})`);
      });
    }

    res.json({
      success: true,
      message: 'Debug completado, revisar logs del servidor',
    });
  } catch (error) {
    console.error('Error en debug:', error.message);
    console.error('Stack:', error.stack);
    res.status(500).json({
      error: error.message,
      stack: error.stack,
    });
  }
};
