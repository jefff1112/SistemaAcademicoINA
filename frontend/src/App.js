// Archivo App: define el enrutador principal y las rutas públicas y privadas del Sistema Académico INA.
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Login from './components/Auth/Login';
import PrivateRoute from './components/Auth/PrivateRoute';
import PublicLayout from './components/Layout/PublicLayout';

// Páginas Públicas
import HomePage from './components/HomePage';
import NuevoIngreso from './components/NuevoIngreso';
import CulturaInstitucional from './components/CulturaInstitucional';
import Contactanos from './components/Contactanos';
import Bachilleratos from './components/Bachilleratos';
import AreasExtracurriculares from './components/AreasExtracurriculares';

// Admin
import DashboardAdmin from './components/Admin/DashboardAdmin';
import GestionUsuarios from './components/Admin/GestionUsuarios';
import GestionRoles from './components/Admin/GestionRoles';
import ConfiguracionAdmin from './components/Admin/ConfiguracionAdmin';
import GenerarHorarios from './components/Horarios/GenerarHorarios';
import AuditoriaAdmin from './components/Admin/AuditoriaAdmin';
import RespaldosAdmin from './components/Admin/RespaldosAdmin';
import ReportesSistemaAdmin from './components/Admin/ReportesSistemaAdmin';
import Notificaciones from './components/Admin/Notificaciones';
import CargaMasivaAspirantes from './components/Admin/CargaMasivaAspirantes';
import GestionMateriasAdmin from './components/Admin/GestionMateriasAdmin';
import GestionGradosAdmin from './components/Admin/GestionGradosAdmin';
import GestionEspecialidadesAdmin from './components/Admin/GestionEspecialidadesAdmin';
import GestionSeccionesAdmin from './components/Admin/GestionSeccionesAdmin';
import GestionPeriodosAdmin from './components/Admin/GestionPeriodosAdmin';
import GestionConstanciasAdmin from './components/Admin/GestionConstancias';

// Shared
import GestionTituloEnProceso from './components/Shared/GestionTituloEnProceso';
import GestionModulosEspecialidad from './components/Shared/GestionModulosEspecialidad';
import AsignarModulosDocentes from './components/Shared/AsignarModulosDocentes';

// Direccion (consulta + exportaciones)
import ActividadesConsultaDireccion from './components/Direccion/ActividadesConsulta';
import CuadroAuxiliarConsultaDireccion from './components/Direccion/CuadroAuxiliarConsulta';
import ExportacionesExcelDireccion from './components/Direccion/ExportacionesExcel';

// Registro Academico (consulta + exportaciones)
import ActividadesConsultaRegistro from './components/RegistroAcademico/ActividadesConsulta';
import CuadroAuxiliarConsultaRegistro from './components/RegistroAcademico/CuadroAuxiliarConsulta';
import ExportacionesExcelRegistro from './components/RegistroAcademico/ExportacionesExcel';

// Direccion
import DashboardDireccion from './components/Direccion/DashboardDireccion';
import GestionAspirantesDireccion from './components/Direccion/GestionAspirantesDireccion';
import GestionEstudiantesDireccion from './components/Direccion/GestionEstudiantesDireccion';
import GestionDocentesDireccion from './components/Direccion/GestionDocentesDireccion';
import GestionClases from './components/Direccion/GestionClases';

import GestionAsistenciasDireccion from './components/Direccion/GestionAsistenciasDireccion';
import GestionConductaDireccion from './components/Direccion/GestionConductaDireccion';
import GestionPeriodosDireccion from './components/Direccion/GestionPeriodosDireccion';
import AuditoriaDireccion from './components/Direccion/AuditoriaDireccion';
import AvisosDireccion from './components/Direccion/AvisosDireccion';
import GestionEntrevistas from './components/Direccion/GestionEntrevistas';
import ReportesAvanzados from './components/Direccion/ReportesAvanzados';
import GestionMateriasDireccion from './components/Direccion/GestionMateriasDireccion';
import ExportarBoletas from './components/Direccion/ExportarBoletas';
import BoletaNotasEstudianteDireccion from './components/Direccion/BoletaNotasEstudiante';
import CuadroAuxiliarDireccion from './components/Direccion/CuadroAuxiliarDigital';

import GestionConstanciasDireccion from './components/Direccion/GestionConstancias';

// Registro Academico
import DashboardRegistro from './components/RegistroAcademico/DashboardRegistro';
import GestionAspirantesRegistro from './components/RegistroAcademico/GestionAspirantesRegistro';
import GestionMatriculas from './components/RegistroAcademico/GestionMatriculas';
import GestionEstudiantesRegistro from './components/RegistroAcademico/GestionEstudiantesRegistro';
import GestionAsistenciasRegistro from './components/RegistroAcademico/GestionAsistenciasRegistro';
import GestionConductaRegistro from './components/RegistroAcademico/GestionConductaRegistro';
import BoletaNotasRegistro from './components/RegistroAcademico/BoletaNotasRegistro';
import PublicacionResultados from './components/RegistroAcademico/PublicacionResultados';
import ImportarNotasRegistro from './components/RegistroAcademico/ImportarNotasRegistro';
import CertificadosRegistro from './components/RegistroAcademico/CertificadosRegistro';
import DocumentosEstudiantes from './components/RegistroAcademico/DocumentosEstudiantes';
import HistorialAcademicoRegistro from './components/RegistroAcademico/HistorialAcademicoRegistro';
import ReportesInasistencias from './components/RegistroAcademico/ReportesInasistencias';
import GestionMateriasRegistro from './components/RegistroAcademico/GestionMateriasRegistro';
import GestionEspecialidadesRegistro from './components/RegistroAcademico/GestionEspecialidadesRegistro';
import ExportarBoletasRegistro from './components/RegistroAcademico/ExportarBoletasRegistro';
import CuadroAuxiliarRegistro from './components/RegistroAcademico/CuadroAuxiliarDigital';
import BoletaNotasEstudianteRegistro from './components/RegistroAcademico/BoletaNotasEstudiante';
import GestionConstanciasRegistro from './components/RegistroAcademico/GestionConstancias';

// Docente
import DashboardDocente from './components/Docente/DashboardDocente';
import MisClasesDocente from './components/Docente/MisClasesDocente';
import AsistenciasDocente from './components/Docente/AsistenciasDocente';
import MiHorarioDocente from './components/Docente/MiHorarioDocente';
import ActividadesDocente from './components/Docente/ActividadesDocente';
import AvisosDocente from './components/Docente/AvisosDocente';
import PerfilDocente from './components/Docente/PerfilDocente';
import GestionNotasDocente from './components/Docente/GestionNotasDocente';
import ResultadosPeriodos from './components/Docente/ResultadosPeriodos';
import CuadroAuxiliarDocente from './components/Docente/CuadroAuxiliarDigital';
import ActivityManagerDocente from './components/Docente/ActivityManager';

// Estudiante
import DashboardEstudiante from './components/Estudiante/DashboardEstudiante';
import MisNotas from './components/Estudiante/MisNotas';
import MisAsistencias from './components/Estudiante/MisAsistencias';
import MiHorario from './components/Estudiante/MiHorario';
import MiConducta from './components/Estudiante/MiConducta';
import MisFaltas from './components/Estudiante/MisFaltas';
import HistorialAcademico from './components/Estudiante/HistorialAcademico';
import ConstanciasEstudiante from './components/Estudiante/ConstanciasEstudiante';
import PerfilEstudiante from './components/Estudiante/PerfilEstudiante';
import MisActividades from './components/Estudiante/MisActividades';
import BoletaNotasEstudianteEstudiante from './components/Estudiante/BoletaNotasEstudiante';

// Encargado
import DashboardEncargado from './components/Encargado/DashboardEncargado';
import NotasEncargado from './components/Encargado/NotasEncargado';
import AsistenciasEncargado from './components/Encargado/AsistenciasEncargado';

// Perfil
import MiPerfil from './components/Perfil/MiPerfil';

// Componente principal: configura todas las rutas de la aplicación según el rol.
function App() {
    return (
        <Router>
            <AuthProvider>
                <Routes>
                    {/* Rutas Públicas */}
                    <Route path="/" element={<PublicLayout><HomePage /></PublicLayout>} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/nuevo-ingreso" element={<PublicLayout><NuevoIngreso /></PublicLayout>} />
                    <Route path="/cultura-institucional" element={<PublicLayout><CulturaInstitucional /></PublicLayout>} />
                    <Route path="/contactanos" element={<PublicLayout><Contactanos /></PublicLayout>} />
                    <Route path="/bachilleratos" element={<PublicLayout><Bachilleratos /></PublicLayout>} />
                    <Route path="/areas-extracurriculares" element={<PublicLayout><AreasExtracurriculares /></PublicLayout>} />

                    {/* Ruta Dashboard - Redirige según el rol */}
                    <Route path="/dashboard" element={<PrivateRoute />} />

                    {/* ADMIN */}
                    <Route path="/admin/usuarios" element={<PrivateRoute><GestionUsuarios /></PrivateRoute>} />
                    <Route path="/admin/roles" element={<PrivateRoute><GestionRoles /></PrivateRoute>} />
                    <Route path="/admin/configuracion" element={<PrivateRoute><ConfiguracionAdmin /></PrivateRoute>} />
                    <Route path="/admin/auditoria" element={<PrivateRoute><AuditoriaAdmin /></PrivateRoute>} />
                    <Route path="/admin/respaldos" element={<PrivateRoute><RespaldosAdmin /></PrivateRoute>} />
                    <Route path="/admin/reportes" element={<PrivateRoute><ReportesSistemaAdmin /></PrivateRoute>} />
                    <Route path="/admin/notificaciones" element={<PrivateRoute><Notificaciones /></PrivateRoute>} />
                    <Route path="/admin/carga-masiva" element={<PrivateRoute><CargaMasivaAspirantes /></PrivateRoute>} />
                    <Route path="/admin/materias" element={<PrivateRoute><GestionMateriasAdmin /></PrivateRoute>} />
                    <Route path="/admin/grados" element={<PrivateRoute><GestionGradosAdmin /></PrivateRoute>} />
                    <Route path="/admin/especialidades" element={<PrivateRoute><GestionEspecialidadesAdmin /></PrivateRoute>} />
                    <Route path="/admin/secciones" element={<PrivateRoute><GestionSeccionesAdmin /></PrivateRoute>} />
                    <Route path="/admin/periodos" element={<PrivateRoute><GestionPeriodosAdmin /></PrivateRoute>} />
                    <Route path="/admin/horarios/generar" element={<PrivateRoute><GenerarHorarios /></PrivateRoute>} />

                    {/* DIRECCION */}
                    <Route path="/direccion/gestion-aspirantes" element={<PrivateRoute><GestionAspirantesDireccion /></PrivateRoute>} />
                    <Route path="/direccion/estudiantes" element={<PrivateRoute><GestionEstudiantesDireccion /></PrivateRoute>} />
                    <Route path="/direccion/docentes" element={<PrivateRoute><GestionDocentesDireccion /></PrivateRoute>} />
                    <Route path="/direccion/clases" element={<PrivateRoute><GestionClases /></PrivateRoute>} />
                    <Route path="/direccion/materias" element={<PrivateRoute><GestionMateriasDireccion /></PrivateRoute>} />
                    <Route path="/direccion/cuadro-auxiliar" element={<PrivateRoute><CuadroAuxiliarDireccion /></PrivateRoute>} />
                    
                    <Route path="/direccion/asistencias" element={<PrivateRoute><GestionAsistenciasDireccion /></PrivateRoute>} />
                    <Route path="/direccion/conducta" element={<PrivateRoute><GestionConductaDireccion /></PrivateRoute>} />
                    <Route path="/direccion/periodos" element={<PrivateRoute><GestionPeriodosDireccion /></PrivateRoute>} />
                    <Route path="/direccion/exportar-boletas" element={<PrivateRoute><ExportarBoletas /></PrivateRoute>} />
                    <Route path="/direccion/boleta-notas" element={<PrivateRoute><BoletaNotasEstudianteDireccion titulo="Boleta de Notas - Direccion" /></PrivateRoute>} />
                    <Route path="/direccion/reportes-avanzados" element={<PrivateRoute><ReportesAvanzados /></PrivateRoute>} />
                    <Route path="/direccion/auditoria" element={<PrivateRoute><AuditoriaDireccion /></PrivateRoute>} />
                    <Route path="/direccion/avisos" element={<PrivateRoute><AvisosDireccion /></PrivateRoute>} />
                    <Route path="/direccion/entrevistas" element={<PrivateRoute><GestionEntrevistas /></PrivateRoute>} />
                    <Route path="/direccion/constancias" element={<PrivateRoute><GestionConstanciasDireccion /></PrivateRoute>} />
                    
                    <Route path="/direccion/actividades" element={<PrivateRoute><ActividadesConsultaDireccion /></PrivateRoute>} />
                    <Route path="/direccion/cuadro-notas-consulta" element={<PrivateRoute><CuadroAuxiliarConsultaDireccion /></PrivateRoute>} />
                    <Route path="/direccion/exportaciones" element={<PrivateRoute><ExportacionesExcelDireccion /></PrivateRoute>} />

                    {/* REGISTRO ACADEMICO */}
                    <Route path="/registro/dashboard" element={<PrivateRoute><DashboardRegistro /></PrivateRoute>} />
                    <Route path="/registro/aspirantes" element={<PrivateRoute><GestionAspirantesRegistro /></PrivateRoute>} />
                    <Route path="/registro/matriculas" element={<PrivateRoute><GestionMatriculas /></PrivateRoute>} />
                    <Route path="/registro/estudiantes" element={<PrivateRoute><GestionEstudiantesRegistro /></PrivateRoute>} />
                    <Route path="/registro/cuadro-auxiliar" element={<PrivateRoute><CuadroAuxiliarRegistro /></PrivateRoute>} />
                    <Route path="/registro/especialidades" element={<PrivateRoute><GestionEspecialidadesRegistro /></PrivateRoute>} />
                    <Route path="/registro/materias" element={<PrivateRoute><GestionMateriasRegistro /></PrivateRoute>} />
                    <Route path="/registro/asistencias" element={<PrivateRoute><GestionAsistenciasRegistro /></PrivateRoute>} />
                    <Route path="/registro/conducta" element={<PrivateRoute><GestionConductaRegistro /></PrivateRoute>} />
                    <Route path="/registro/boletas" element={<PrivateRoute><BoletaNotasRegistro /></PrivateRoute>} />
                    <Route path="/registro/resultados" element={<PrivateRoute><PublicacionResultados /></PrivateRoute>} />
                    <Route path="/registro/importar-notas" element={<PrivateRoute><ImportarNotasRegistro /></PrivateRoute>} />
                    <Route path="/registro/constancias" element={<PrivateRoute><GestionConstanciasRegistro /></PrivateRoute>} />
                    <Route path="/registro/certificados" element={<PrivateRoute><CertificadosRegistro /></PrivateRoute>} />
                    <Route path="/registro/documentos" element={<PrivateRoute><DocumentosEstudiantes /></PrivateRoute>} />
                    <Route path="/registro/historial" element={<PrivateRoute><HistorialAcademicoRegistro /></PrivateRoute>} />
                    <Route path="/registro/reportes-inasistencias" element={<PrivateRoute><ReportesInasistencias /></PrivateRoute>} />
                    <Route path="/registro/exportar-boletas" element={<PrivateRoute><ExportarBoletasRegistro /></PrivateRoute>} />
                    <Route path="/registro/boleta-notas" element={<PrivateRoute><BoletaNotasEstudianteRegistro titulo="Boleta de Notas - Registro Academico" /></PrivateRoute>} />
                    <Route path="/registro/actividades" element={<PrivateRoute><ActividadesConsultaRegistro /></PrivateRoute>} />
                    <Route path="/registro/cuadro-notas-consulta" element={<PrivateRoute><CuadroAuxiliarConsultaRegistro /></PrivateRoute>} />
                    <Route path="/registro/exportaciones" element={<PrivateRoute><ExportacionesExcelRegistro /></PrivateRoute>} />

                    {/* DOCENTE */}
                    <Route path="/docente/dashboard" element={<PrivateRoute><DashboardDocente /></PrivateRoute>} />
                    <Route path="/docente/mis-clases" element={<PrivateRoute><MisClasesDocente /></PrivateRoute>} />
                    <Route path="/docente/cuadro-auxiliar" element={<PrivateRoute><CuadroAuxiliarDocente /></PrivateRoute>} />
                    <Route path="/docente/asistencias" element={<PrivateRoute><AsistenciasDocente /></PrivateRoute>} />
                    <Route path="/docente/horario" element={<PrivateRoute><MiHorarioDocente /></PrivateRoute>} />
                    <Route path="/docente/actividades" element={<PrivateRoute><ActividadesDocente /></PrivateRoute>} />
                    <Route path="/docente/avisos" element={<PrivateRoute><AvisosDocente /></PrivateRoute>} />
                    <Route path="/docente/perfil" element={<PrivateRoute><PerfilDocente /></PrivateRoute>} />
                    {/* ✅ SOLO UNA VEZ */}
                    <Route path="/docente/gestion-notas" element={<PrivateRoute><GestionNotasDocente /></PrivateRoute>} />
                    <Route path="/docente/resultados-periodo" element={<PrivateRoute><ResultadosPeriodos /></PrivateRoute>} />
                    <Route path="/docente/actividades-gestion" element={<PrivateRoute><ActivityManagerDocente /></PrivateRoute>} />

                    {/* ESTUDIANTE */}
                    <Route path="/estudiante/dashboard" element={<PrivateRoute><DashboardEstudiante /></PrivateRoute>} />
                    <Route path="/estudiante/notas" element={<PrivateRoute><MisNotas /></PrivateRoute>} />
                    <Route path="/estudiante/actividades" element={<PrivateRoute><MisActividades /></PrivateRoute>} />
                    <Route path="/estudiante/asistencias" element={<PrivateRoute><MisAsistencias /></PrivateRoute>} />
                    <Route path="/estudiante/horario" element={<PrivateRoute><MiHorario /></PrivateRoute>} />
                    <Route path="/estudiante/conducta" element={<PrivateRoute><MiConducta /></PrivateRoute>} />
                    <Route path="/estudiante/faltas" element={<PrivateRoute><MisFaltas /></PrivateRoute>} />
                    <Route path="/estudiante/historial" element={<PrivateRoute><HistorialAcademico /></PrivateRoute>} />
                    <Route path="/estudiante/constancias" element={<PrivateRoute><ConstanciasEstudiante /></PrivateRoute>} />
                    <Route path="/estudiante/perfil" element={<PrivateRoute><PerfilEstudiante /></PrivateRoute>} />
                    <Route path="/estudiante/boleta-notas" element={<PrivateRoute><BoletaNotasEstudianteEstudiante titulo="Mi Boleta de Notas" /></PrivateRoute>} />

                    {/* CONSTANCIAS (personal: direccion, sub director, registro y admin) */}
                    <Route path="/direccion/constancias" element={<PrivateRoute><GestionConstanciasDireccion /></PrivateRoute>} />
                    <Route path="/admin/constancias" element={<PrivateRoute><GestionConstanciasAdmin /></PrivateRoute>} />
                    <Route path="/registro/constancias" element={<PrivateRoute><GestionConstanciasRegistro /></PrivateRoute>} />

                    {/* TÍTULO EN PROCESO (nueva sección dedicada) */}
                    <Route path="/titulo-en-proceso" element={<PrivateRoute><GestionTituloEnProceso /></PrivateRoute>} />
                    <Route path="/modulos-especialidad" element={<PrivateRoute><GestionModulosEspecialidad /></PrivateRoute>} />
                    <Route path="/asignar-modulos" element={<PrivateRoute><AsignarModulosDocentes /></PrivateRoute>} />

                    {/* ENCARGADO */}
                    <Route path="/encargado/dashboard" element={<PrivateRoute><DashboardEncargado /></PrivateRoute>} />
                    <Route path="/encargado/notas" element={<PrivateRoute><NotasEncargado /></PrivateRoute>} />
                    <Route path="/encargado/asistencias" element={<PrivateRoute><AsistenciasEncargado /></PrivateRoute>} />

                    {/* PERFIL */}
                    <Route path="/perfil" element={<PrivateRoute><MiPerfil /></PrivateRoute>} />

                    {/* 404 */}
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </AuthProvider>
        </Router>
    );
}

export default App;