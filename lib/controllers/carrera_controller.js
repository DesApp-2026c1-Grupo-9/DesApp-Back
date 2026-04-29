import Carrera from '../models/carrera';
import PlanDeEstudio from '../models/planDeEstudio';
import PlanMateria from '../models/planMateria';

export const index = async (req, res) => {
  const carreras = await Carrera.findAll({
    include: [PlanDeEstudio],
  });

  const result = await Promise.all(carreras.map(async (carrera) => {
    const planesEstudio = await Promise.all(carrera.PlanDeEstudios.map(async (plan) => {
      const materiasCount = await PlanMateria.count({ where: { planId: plan.id } });
      return {
        id: plan.id,
        nombre: plan.nombre,
        estado: plan.estado.charAt(0).toUpperCase() + plan.estado.slice(1),
        materias: materiasCount,
        cargaHoraria: null,
      };
    }));

    return {
      id: carrera.id,
      nombre: carrera.nombre,
      titulo: carrera.titulo,
      instituto: carrera.instituto,
      duracionEstimada: carrera.duracion,
      planesEstudio: planesEstudio,
    };
  }));

  res.json({ data: result });
};

export const show = async (req, res) => {
  const carrera = await Carrera.findByPk(req.params.id, {
    include: [PlanDeEstudio],
  });

  if (!carrera) {
    return res.status(404).json({ message: `No se encontró una carrera con id ${req.params.id}` });
  }

  const planesEstudio = await Promise.all(carrera.PlanDeEstudios.map(async (plan) => {
    const materiasCount = await PlanMateria.count({ where: { planId: plan.id } });
    return {
      id: plan.id,
      nombre: plan.nombre,
      estado: plan.estado.charAt(0).toUpperCase() + plan.estado.slice(1),
      materias: materiasCount,
      cargaHoraria: null,
    };
  }));

  const result = {
    id: carrera.id,
    nombre: carrera.nombre,
    titulo: carrera.titulo,
    instituto: carrera.instituto,
    duracionEstimada: carrera.duracion,
    planesEstudio: planesEstudio,
  };

  res.json({ data: result });
};
