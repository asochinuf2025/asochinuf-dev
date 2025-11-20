// Configuración centralizada de la API
// Usar rutas relativas automáticamente (funciona en desarrollo y producción)
const API_URL = import.meta.env.VITE_API_URL ||
  (typeof window !== 'undefined' ? '' : 'http://localhost:5001');

export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: `${API_URL}/api/auth/login`,
    REGISTRO: `${API_URL}/api/auth/registro`,
    GOOGLE: `${API_URL}/api/auth/google`,
    ME: `${API_URL}/api/auth/me`,
    SOLICITAR_RECUPERACION: `${API_URL}/api/auth/solicitar-recuperacion`,
    VERIFICAR_TOKEN: (token) => `${API_URL}/api/auth/verificar-token/${token}`,
    RESTABLECER_CONTRASENA: `${API_URL}/api/auth/restablecer-contrasena`,
    CAMBIAR_CONTRASENA: `${API_URL}/api/auth/cambiar-contrasena`,
    ACTUALIZAR_FOTO: `${API_URL}/api/auth/actualizar-foto`,
  },
  // Excel
  EXCEL: {
    UPLOAD: `${API_URL}/api/excel/upload`,
    HISTORY: `${API_URL}/api/excel/history`,
    SESSION_DETAILS: (sesionId) => `${API_URL}/api/excel/session/${sesionId}`,
  },
  // Cursos
  CURSOS: {
    GET_ALL: `${API_URL}/api/cursos`,
    GET_ONE: (id) => `${API_URL}/api/cursos/${id}`,
    CREATE: `${API_URL}/api/cursos`,
    UPDATE: (id) => `${API_URL}/api/cursos/${id}`,
    DELETE: (id) => `${API_URL}/api/cursos/${id}`,
    BY_NIVEL: (nivel) => `${API_URL}/api/cursos/nivel/${nivel}`,
    BY_CATEGORIA: (categoriaId) => `${API_URL}/api/cursos/categoria/${categoriaId}`,
    SEARCH: (query) => `${API_URL}/api/cursos/search?q=${query}`,
  },
  // Planteles
  PLANTELES: {
    GET_ALL: `${API_URL}/api/planteles`,
    GET_ACTIVOS: `${API_URL}/api/planteles/activos`,
    GET_ONE: (id) => `${API_URL}/api/planteles/${id}`,
    CREATE: `${API_URL}/api/planteles`,
    UPDATE: (id) => `${API_URL}/api/planteles/${id}`,
    DELETE: (id) => `${API_URL}/api/planteles/${id}`,
  },
  // Categorías
  CATEGORIAS: {
    GET_ALL: `${API_URL}/api/categorias`,
    GET_ACTIVAS: `${API_URL}/api/categorias/activas`,
    GET_ONE: (id) => `${API_URL}/api/categorias/${id}`,
  },
  // Ligas
  LIGAS: {
    BASE: `${API_URL}/api/ligas`,
    GET_ALL: `${API_URL}/api/ligas`,
    GET_POR_CATEGORIA: (categoriaId) => `${API_URL}/api/ligas/categoria/${categoriaId}`,
    CREATE: `${API_URL}/api/ligas`,
    UPDATE: (id) => `${API_URL}/api/ligas/${id}`,
    DELETE: (id) => `${API_URL}/api/ligas/${id}`,
  },
  // Cuotas
  CUOTAS: {
    GET_ALL: `${API_URL}/api/cuotas`,
    GET_RESUMEN: `${API_URL}/api/cuotas/resumen`,
    GET_DISPONIBLES: `${API_URL}/api/cuotas/disponibles/todas`,
    GET_ONE: (id) => `${API_URL}/api/cuotas/${id}`,
    GET_PAGOS: (cuotaId) => `${API_URL}/api/cuotas/${cuotaId}/pagos`,
    CREATE: `${API_URL}/api/cuotas`,
    REGISTRAR_PAGO: (cuotaId) => `${API_URL}/api/cuotas/${cuotaId}/pagos`,
    ESTADISTICAS: `${API_URL}/api/cuotas/estadisticas/general`,
  },
  // Pagos Mercado Pago
  PAYMENTS: {
    INICIAR_PAGO: `${API_URL}/api/payments/iniciar`,
    ESTADO_PAGO: (cuotaId) => `${API_URL}/api/payments/estado/${cuotaId}`,
    WEBHOOK: `${API_URL}/api/payments/webhook`,
  },
  // Inscripciones
  INSCRIPCIONES: {
    MIS_CURSOS: `${API_URL}/api/inscripciones/mis-cursos`,
    INSCRIBIRSE: `${API_URL}/api/inscripciones`,
    VERIFICAR: (id_curso) => `${API_URL}/api/inscripciones/verificar/${id_curso}`,
    CANCELAR: (id_curso) => `${API_URL}/api/inscripciones/${id_curso}`,
    TODAS: `${API_URL}/api/inscripciones/todas`,
  },
  // Cloudinary
  CLOUDINARY: {
    UPLOAD_PERFIL: `${API_URL}/api/cloudinary/upload-perfil`,
    UPLOAD_CURSO: `${API_URL}/api/cloudinary/upload-curso`,
    DELETE: `${API_URL}/api/cloudinary/delete`,
  },
  // Documentos
  DOCUMENTOS: {
    GET_ALL: `${API_URL}/api/documentos`,
    GET_ONE: (id) => `${API_URL}/api/documentos/${id}`,
    GET_CATEGORIAS: `${API_URL}/api/documentos/categorias`,
    CREATE: `${API_URL}/api/documentos`,
    UPDATE: (id) => `${API_URL}/api/documentos/${id}`,
    DELETE: (id) => `${API_URL}/api/documentos/${id}`,
  },
  // Pacientes
  PACIENTES: {
    GET_POSICIONES: `${API_URL}/api/pacientes/posiciones`,
    GET_ALL: `${API_URL}/api/pacientes`,
    GET_ONE: (id) => `${API_URL}/api/pacientes/${id}`,
    CREATE: `${API_URL}/api/pacientes`,
    UPDATE: (id) => `${API_URL}/api/pacientes/${id}`,
    DELETE: (id) => `${API_URL}/api/pacientes/${id}`,
  },
};

export const BASE = API_URL;

export default API_URL;
