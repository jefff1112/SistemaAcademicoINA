const fs = require('fs');

function fixFile(file, fixes) {
    const content = fs.readFileSync(file, 'utf8');
    let lines = content.split('\n');
    
    fixes.forEach(fix => {
        if (fix.line && fix.line <= lines.length) {
            const lineIndex = fix.line - 1;
            if (fix.replace) {
                lines[lineIndex] = lines[lineIndex].replace(fix.replace[0], fix.replace[1]);
            }
            if (fix.remove) {
                lines.splice(lineIndex, 1);
            }
            if (fix.insertAfter) {
                lines.splice(lineIndex + 1, 0, fix.insertAfter);
            }
        }
    });
    
    fs.writeFileSync(file, lines.join('\n'), 'utf8');
    console.log(`Fixed: ${file}`);
}

// Fix Admin GestionConstancias.jsx - syntax error at line 278
fixFile('C:\\Projects\\sistema-academico-frontend\\src\\components\\Admin\\GestionConstancias.jsx', [
    { line: 278, replace: ['format-option.seleccionado { background: #3b82f6; color: white; }', 'format-option.seleccionado { background: #3b82f6; color: white; }'] }
]);

// Fix Direccion GestionConstancias.jsx - remove duplicate esIncapacidad
const fs = require('fs');
let content = fs.readFileSync('C:\\Projects\\sistema-academico-frontend\\src\\components\\Direccion\\GestionConstancias.jsx', 'utf8');
const lines = content.split('\n');
let foundFirst = false;
const cleaned = lines.filter((line, i) => {
    const trimmed = line.trim();
    if (trimmed === "const esIncapacidad = form.tipo === 'Incapacidad';") {
        if (!foundFirst) {
            foundFirst = true;
            return true;
        }
        return false; // Skip duplicate
    }
    return true;
}).join('\n');

fs.writeFileSync('C:\\Projects\\sistema-academico-frontend\\src\\components\\Direccion\\GestionConstancias.jsx', content, 'utf8');
console.log('Fixed Direccion duplicate esIncapacidad');