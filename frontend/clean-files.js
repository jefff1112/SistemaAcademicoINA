const fs = require('fs');

const files = [
  'C:\\Projects\\sistema-academico-frontend\\src\\components\\Admin\\GestionConstancias.jsx',
  'C:\\Projects\\sistema-academico-frontend\\src\\components\\Direccion\\GestionConstancias.jsx',
  'C:\\Projects\\sistema-academico-frontend\\src\\components\\RegistroAcademico\\GestionConstancias.jsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  // Remove duplicate block: from "const esIncapacidad" to "const estudiantesForm = estudiantes.filter" inclusive
  const regex = /\s*const esIncapacidad = form\.tipo === 'Incapacidad';[\s\S]*?const formatosDisponibles = \[\s*\{ valor: 'pdf', etiqueta: 'PDF', descripcion: 'Documento portátil para imprimir' \},\s*\{ valor: 'word', etiqueta: 'Word \.docx', descripcion: 'Documento editable con estilos' \},\s*\{ valor: 'excel', etiqueta: 'Excel \(\.xlsx\)', descripcion: 'Reporte con datos tabulados' \}\s*\];\s*const limpiarFiltros = \(\) => \{[\s\S]*?\}\s*;\s*const terminoEstudiante = busquedaEstudiante\.trim\(\)\.toLowerCase\(\);[\s\S]*?const claseFormSeleccionada = parseInt\(claseEstudianteForm\) \|\| null;\s*const estudiantesForm = estudiantes\.filter\(e =>\s*\([^}]*\)\s*\);/s;
  const cleaned = content.replace(regex, '');
  fs.writeFileSync(file, cleaned, 'utf8');
  console.log('Cleaned:', file);
});

console.log('Done cleaning all files.');