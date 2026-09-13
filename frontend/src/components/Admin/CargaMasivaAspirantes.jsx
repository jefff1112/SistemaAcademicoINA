// Componente Carga Masiva de Aspirantes (Admin): importa aspirantes desde un archivo Excel.
import React, { useState } from 'react';
import DashboardLayout from '../Layout/DashboardLayout';
import API from '../../services/api';
import * as XLSX from 'xlsx';

// Componente principal: gestiona la carga de aspirantes por lote y muestra los resultados.
const CargaMasivaAspirantes = () => {
    // Estados: archivo seleccionado, indicador de carga, vista previa y resultados de la importación.
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [preview, setPreview] = useState([]);
    const [resultados, setResultados] = useState(null);

    // Maneja la selección del archivo Excel y dispara su lectura.
    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            leerExcel(selectedFile);
        }
    };

    // Lee el archivo Excel y muestra una vista previa de los primeros 10 registros.
    const leerExcel = (file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(sheet);
            setPreview(jsonData.slice(0, 10));
        };
        reader.readAsArrayBuffer(file);
    };

    // Procesa el archivo y envía cada aspirante a la API, contando éxitos y fallos.
    const handleUpload = async () => {
        if (!file) {
            alert('Seleccione un archivo primero');
            return;
        }

        setLoading(true);
        const reader = new FileReader();
        reader.onload = async (e) => {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const aspirantes = XLSX.utils.sheet_to_json(sheet);

            let exitosos = 0;
            let fallidos = 0;
            const errores = [];

            for (const aspirante of aspirantes) {
                try {
                    // Petición POST /aspirantes para registrar cada aspirante del archivo.
                    await API.post('/aspirantes', {
                        nombres: aspirante.Nombres || aspirante.nombres,
                        apellidos: aspirante.Apellidos || aspirante.apellidos,
                        dui: aspirante.DUI || aspirante.dui,
                        nie: aspirante.NIE || aspirante.nie,
                        correo: aspirante.Correo || aspirante.correo,
                        telefono: aspirante.Telefono || aspirante.telefono,
                        escuelaProcedencia: aspirante.Escuela || aspirante.escuela,
                        especialidadAspira: aspirante.EspecialidadId || aspirante.especialidadId,
                        nivelAspira: aspirante.Nivel || aspirante.nivel || 'Bachillerato Tecnico'
                    });
                    exitosos++;
                } catch (error) {
                    fallidos++;
                    errores.push(`${aspirante.Nombres || aspirante.nombres}: ${error.response?.data?.mensaje || error.message}`);
                }
            }

            setResultados({ exitosos, fallidos, errores });
            setLoading(false);
        };
        reader.readAsArrayBuffer(file);
    };

    // Genera y descarga una plantilla Excel de ejemplo con el formato requerido.
    const descargarPlantilla = () => {
        const plantilla = [
            { Nombres: 'Ejemplo', Apellidos: 'Perez', DUI: '12345678-9', NIE: 'NIE123', Correo: 'ejemplo@mail.com', Telefono: '12345678', Escuela: 'Centro Escolar', EspecialidadId: 2, Nivel: 'Bachillerato Tecnico' }
        ];
        const ws = XLSX.utils.json_to_sheet(plantilla);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Aspirantes');
        XLSX.writeFile(wb, 'plantilla_aspirantes.xlsx');
    };

    return (
        <DashboardLayout title="Carga Masiva de Aspirantes">
            <div className="card">
                <h3>Cargar Aspirantes desde Excel</h3>
                <p className="info-text">Puede cargar un archivo Excel con la lista de aspirantes. Descargue la plantilla para ver el formato requerido.</p>

                <div style={{ marginBottom: '1rem' }}>
                    <button className="btn-secondary" onClick={descargarPlantilla}>Descargar Plantilla</button>
                </div>

                <div className="form-group">
                    <label>Seleccionar Archivo Excel</label>
                    <input type="file" accept=".xlsx, .xls" onChange={handleFileChange} className="form-control" />
                </div>

                {preview.length > 0 && (
                    <div style={{ marginTop: '1rem' }}>
                        <h4>Vista Previa (primeros 10 registros)</h4>
                        <div className="table-responsive">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        {Object.keys(preview[0]).map(key => <th key={key}>{key}</th>)}
                                    </tr>
                                </thead>
                                <tbody>
                                    {preview.map((row, i) => (
                                        <tr key={i}>
                                            {Object.values(row).map((val, j) => <td key={j}>{val}</td>)}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                <button className="btn-primary" onClick={handleUpload} disabled={loading} style={{ marginTop: '1rem' }}>
                    {loading ? 'Cargando...' : 'Cargar Aspirantes'}
                </button>

                {resultados && (
                    <div style={{ marginTop: '1rem', padding: '1rem', background: '#f8fafc', borderRadius: '8px' }}>
                        <h4>Resultado de la Carga</h4>
                        <p>Exitosos: {resultados.exitosos}</p>
                        <p>Fallidos: {resultados.fallidos}</p>
                        {resultados.errores.length > 0 && (
                            <div>
                                <strong>Errores:</strong>
                                <ul>{resultados.errores.map((e, i) => <li key={i}>{e}</li>)}</ul>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default CargaMasivaAspirantes;