const fs = require('fs');

const files = [
  'C:\\Projects\\sistema-academico-frontend\\src\\components\\Admin\\GestionConstancias.jsx',
  'C:\\Projects\\sistema-academico-frontend\\src\\components\\Direccion\\GestionConstancias.jsx',
  'C:\\Projects\\sistema-academico-frontend\\src\\components\\RegistroAcademico\\GestionConstancias.jsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  let cleanedLines = [];
  const seenDeclarations = new Set();
  
  // Track which declarations we've seen in the middle section (after the component function starts)
  let inComponentBody = false;
  let braceDepth = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    
    // Track brace depth to know when we're inside the component function
    if (trimmed.includes('const GestionConstancias = () => {')) {
      inComponentBody = true;
    }
    if (inComponentBody) {
      // Count braces to know when we leave the component
      for (const char of line) {
        if (char === '{') braceDepth++;
        if (char === '}') braceDepth--;
      }
      if (braceDepth === 0 && inComponentBody) {
        inComponentBody = false;
      }
    }
    
    // Check for duplicate declarations in the component body
    const declMatch = trimmed.match(/^const\s+(\w+)\s*=/);
    if (inComponentBody && declMatch) {
      const declName = declMatch[1];
      const declKey = `const ${declName}`;
      
      // Check if this declaration is a duplicate of one we've already seen in the middle section
      if (seenDeclarations.has(declName) && !['cargarDatos', 'mostrarMensaje', 'tipoLabel', 'nombreEstudiante', 'fechaLabel', 'cambiarCampo', 'generarConstancia', 'resetForm', 'construirFormData', 'emitir', 'editar', 'anular', 'descargarDocumento', 'fechaLabel', 'esIncapacidad', 'formatosDisponibles', 'limpiarFiltros', 'terminoEstudiante', 'claseFormSeleccionada', 'estudiantesForm', 'esIncapacidad', 'cargarDatos', 'mostrarMensaje', 'tipoLabel', 'nombreEstudiante', 'fechaLabel', 'cambiarCampo', 'generarConstancia', 'resetForm', 'construirFormData', 'emitir', 'editar', 'anular', 'descargarDocumento'].includes(declName)) {
        // This is a duplicate declaration in the middle section - skip it
        console.log(`Skipping duplicate declaration: ${declName} in ${file}`);
        continue;
      }
      
      // Mark as seen
      seenDeclarations.add(declName);
    }
    
    cleanedLines.push(line);
  }
  
  // Also need to remove the duplicate helper functions at the end of the file (outside the component)
  // Find the last occurrence of "export default GestionConstancias" and remove everything after it
  let exportIndex = cleanedLines.findIndex(line => line.trim().startsWith('export default GestionConstancias'));
  if (exportIndex !== -1) {
    // Keep only up to and including the export line
    cleanedLines = cleanedLines.slice(0, exportIndex + 1);
  }
  
  const cleanedContent = cleanedLines.join('\n');
  fs.writeFileSync(file, cleanedContent, 'utf8');
  console.log('Cleaned:', file);
});

console.log('Done cleaning all files.');