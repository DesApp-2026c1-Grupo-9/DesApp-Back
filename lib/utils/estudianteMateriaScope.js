import { Op } from 'sequelize';
import db from '../models/index.js';

const { Estudiante, EstudianteCarrera, CarreraMateria } = db;

const uniqueNumeric = (values) => [
  ...new Set(values.map((value) => Number(value)).filter(Number.isFinite)),
];

export const getEstudianteMateriaScope = async ({
  estudianteId = null,
  usuarioId = null,
} = {}) => {
  let resolvedEstudianteId = Number(estudianteId);

  if (
    (estudianteId === null || !Number.isFinite(resolvedEstudianteId)) &&
    usuarioId !== null
  ) {
    const estudiante = await Estudiante.findOne({
      where: { usuarioId: Number(usuarioId) },
      attributes: ['id'],
    });

    resolvedEstudianteId = Number(estudiante?.id);
  }

  if (!Number.isFinite(resolvedEstudianteId)) {
    return {
      estudianteId: null,
      carreraIds: [],
      materiaIds: [],
    };
  }

  const relacionesCarrera = await EstudianteCarrera.findAll({
    where: { estudianteId: resolvedEstudianteId },
    attributes: ['carreraId'],
  });

  const carreraIds = uniqueNumeric(
    relacionesCarrera.map((relacion) => relacion.carreraId)
  );

  if (carreraIds.length === 0) {
    return {
      estudianteId: resolvedEstudianteId,
      carreraIds: [],
      materiaIds: [],
    };
  }

  const relacionesMateria = await CarreraMateria.findAll({
    where: {
      carreraId: { [Op.in]: carreraIds },
    },
    attributes: ['materiaId'],
  });

  return {
    estudianteId: resolvedEstudianteId,
    carreraIds,
    materiaIds: uniqueNumeric(
      relacionesMateria.map((relacion) => relacion.materiaId)
    ),
  };
};
