const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

const templates = {
  sesion_creada_conexion({
    actorNombre,
    actorApellido,
    materiaNombre,
    sesionTema,
    sesionId,
  }) {
    return {
      subject: `${actorNombre} ${actorApellido} creó una sesión de estudio`,
      html: `
        <h2>Nueva sesión de estudio</h2>
        <p><strong>${actorNombre} ${actorApellido}</strong> creó una sesión de estudio para <strong>${
        materiaNombre || 'estudio'
      }</strong>.</p>
        <p><strong>Tema:</strong> ${sesionTema || ''}</p>
        <p style="margin-top:16px;"><a href="${FRONTEND_URL}/sesiones/${sesionId}" style="background:#1976d2;color:#fff;padding:10px 20px;border-radius:4px;text-decoration:none;">Ver sesión en DesApp →</a></p>
      `,
    };
  },

  sesion_creada_materia({
    actorNombre,
    actorApellido,
    materiaNombre,
    sesionTema,
    sesionId,
  }) {
    return {
      subject: `${actorNombre} ${actorApellido} creó una sesión de estudio`,
      html: `
        <h2>Nueva sesión de estudio</h2>
        <p><strong>${actorNombre} ${actorApellido}</strong> creó una sesión de estudio para la materia <strong>${
        materiaNombre || 'estudio'
      }</strong>.</p>
        <p><strong>Tema:</strong> ${sesionTema || ''}</p>
        <p style="margin-top:16px;"><a href="${FRONTEND_URL}/sesiones/${sesionId}" style="background:#1976d2;color:#fff;padding:10px 20px;border-radius:4px;text-decoration:none;">Ver sesión en DesApp →</a></p>
      `,
    };
  },

  denuncia_recibida({ titulo }) {
    return {
      subject: 'Tu material fue denunciado',
      html: `
        <h2>Denuncia recibida</h2>
        <p>Tu material <strong>"${titulo}"</strong> ha sido denunciado y está siendo revisado por un administrador.</p>
      `,
    };
  },

  material_suspendido({ titulo }) {
    return {
      subject: 'Tu material fue suspendido',
      html: `
        <h2>Material suspendido</h2>
        <p>Tu material <strong>"${titulo}"</strong> ha sido suspendido temporalmente por acumular denuncias.</p>
      `,
    };
  },

  material_revocado({ titulo }) {
    return {
      subject: 'Tu material fue restaurado',
      html: `
        <h2>Material restaurado</h2>
        <p>Tu material <strong>"${titulo}"</strong> ha sido restaurado y ya está visible nuevamente.</p>
      `,
    };
  },

  sesion_cancelada({
    actorNombre,
    actorApellido,
    materiaNombre,
    sesionTema,
    sesionId,
  }) {
    return {
      subject: `${actorNombre} ${actorApellido} canceló una sesión de estudio`,
      html: `
        <h2>Sesión cancelada</h2>
        <p><strong>${actorNombre} ${actorApellido}</strong> canceló la sesión de estudio para <strong>${
        materiaNombre || 'estudio'
      }</strong>.</p>
        <p><strong>Tema:</strong> ${sesionTema || ''}</p>
        <p style="margin-top:16px;"><a href="${FRONTEND_URL}/sesiones/${sesionId}" style="background:#1976d2;color:#fff;padding:10px 20px;border-radius:4px;text-decoration:none;">Ver sesión en DesApp →</a></p>
      `,
    };
  },

  sesion_recordatorio({ materiaNombre, sesionTema, sesionId, fechaHora }) {
    const fecha = fechaHora
      ? new Date(fechaHora).toLocaleString('es-AR', {
          dateStyle: 'long',
          timeStyle: 'short',
        })
      : '';
    return {
      subject: 'Recordatorio: sesión de estudio mañana',
      html: `
        <h2>Recordatorio de sesión</h2>
        <p>Te recordamos que la sesión de estudio para <strong>${
          materiaNombre || 'estudio'
        }</strong> comienza mañana.</p>
        <p><strong>Tema:</strong> ${sesionTema || ''}</p>
        <p><strong>Fecha y hora:</strong> ${fecha}</p>
        <p style="margin-top:16px;"><a href="${FRONTEND_URL}/sesiones/${sesionId}" style="background:#1976d2;color:#fff;padding:10px 20px;border-radius:4px;text-decoration:none;">Ver sesión en DesApp →</a></p>
      `,
    };
  },

  sesion_participante_nuevo({
    actorNombre,
    actorApellido,
    materiaNombre,
    sesionTema,
    sesionId,
  }) {
    return {
      subject: `${actorNombre} ${actorApellido} se unió a tu sesión de estudio`,
      html: `
        <h2>Nuevo participante</h2>
        <p><strong>${actorNombre} ${actorApellido}</strong> se unió a tu sesión de estudio para <strong>${
        materiaNombre || 'estudio'
      }</strong>.</p>
        <p><strong>Tema:</strong> ${sesionTema || ''}</p>
        <p style="margin-top:16px;"><a href="${FRONTEND_URL}/sesiones/${sesionId}" style="background:#1976d2;color:#fff;padding:10px 20px;border-radius:4px;text-decoration:none;">Ver sesión en DesApp →</a></p>
      `,
    };
  },

  sesion_solicitud_nueva({
    actorNombre,
    actorApellido,
    materiaNombre,
    sesionTema,
    sesionId,
  }) {
    return {
      subject: `${actorNombre} ${actorApellido} quiere unirse a tu sesión de estudio`,
      html: `
        <h2>Solicitud de unión</h2>
        <p><strong>${actorNombre} ${actorApellido}</strong> solicita unirse a tu sesión de estudio para <strong>${
        materiaNombre || 'estudio'
      }</strong>.</p>
        <p><strong>Tema:</strong> ${sesionTema || ''}</p>
        <p style="margin-top:16px;"><a href="${FRONTEND_URL}/sesiones/${sesionId}" style="background:#1976d2;color:#fff;padding:10px 20px;border-radius:4px;text-decoration:none;">Ver sesión en DesApp →</a></p>
      `,
    };
  },

  conexion_aprobo_materia({ actorNombre, actorApellido, materiaNombre }) {
    return {
      subject: `${actorNombre} ${actorApellido} aprobó una materia`,
      html: `
        <h2>¡Aprobación!</h2>
        <p><strong>${actorNombre} ${actorApellido}</strong> aprobó la materia <strong>${
        materiaNombre || 'una materia'
      }</strong>.</p>
      `,
    };
  },

  novedad_like({ actorNombre, actorApellido, titulo }) {
    return {
      subject: `A ${actorNombre} ${actorApellido} le gusta tu publicación`,
      html: `
        <h2>Nuevo like</h2>
        <p>A <strong>${actorNombre} ${actorApellido}</strong> le gusta tu publicación <strong>"${titulo}"</strong>.</p>
      `,
    };
  },

  novedad_comentario({ actorNombre, actorApellido, titulo }) {
    return {
      subject: `${actorNombre} ${actorApellido} comentó tu publicación`,
      html: `
        <h2>Nuevo comentario</h2>
        <p><strong>${actorNombre} ${actorApellido}</strong> comentó en tu publicación <strong>"${titulo}"</strong>.</p>
      `,
    };
  },

  comentario_respuesta({ actorNombre, actorApellido, titulo }) {
    return {
      subject: `${actorNombre} ${actorApellido} respondió tu comentario`,
      html: `
        <h2>Respuesta a tu comentario</h2>
        <p><strong>${actorNombre} ${actorApellido}</strong> respondió a tu comentario en <strong>"${titulo}"</strong>.</p>
      `,
    };
  },
};

export default function buildEmail(tipo, data) {
  const builder = templates[tipo];
  if (!builder) {
    return {
      subject: `Notificación: ${data.titulo || 'Nueva notificación'}`,
      html: `<p>${
        data.titulo || 'Tienes una nueva notificación en la plataforma.'
      }</p>`,
    };
  }
  return builder(data);
}
