const fs = require('fs');

// Fix Direccion GestionConstancias.jsx - remove duplicate esIncapacidad
const file1 = 'C:\\Projects\\sistema-academico-frontend\\src\\components\\Direccion\\GestionConstancias.jsx';
let content = fs.readFileSync(file1, 'utf8');
const lines = content.split('\n');
let foundFirst = false;
const cleaned = lines.filter((line) => {
    const trimmed = line.trim();
    if (trimmed === "const esIncapacidad = form.tipo === 'Incapacidad';") {
        if (!foundFirst) {
            foundFirst = true;
            return true;
        }
        return false;
    }
    return true;
}).join('\n');

fs.writeFileSync('C:\\Projects\\sistema-academico-frontend\\src\\components\\Direccion\\GestionConstancias.jsx', content, 'utf8');
console.log('Fixed Direccion duplicate esIncapacidad');

// Fix Admin GestionConstancias.jsx - fix syntax error at line 278
const file2 = 'C:\\Projects\\sistema-academico-frontend\\src\\components\\Admin\\GestionConstancias.jsx';
let content2 = fs.readFileSync('C:\\Projects\\sistema-academico-frontend\\src\\components\\Admin\\GestionConstancias.jsx', 'utf8');
const lines2 = content2.split('\n');
if (lines2.length > 277) {
    lines2[277] = lines2[277].replace(/[^\w\s,.:;{}()\[\]"\'=<>!@#$%^&*|\\/\\-]/g, '');
    fs.writeFileSync('C:\\Projects\\sistema-academico-frontend\\src\\components\\Admin\\GestionConstancias.jsx', lines2.join('\n'), 'utf8');
    console.log('Fixed Admin line 278');
}

// Fix RegistroAcademico GestionConstancias.jsx - syntax error at line 403
const file3 = 'C:\\Projects\\sistema-academico-frontend\\src\\components\\RegistroAcademico\\GestionConstancias.jsx';
let content3 = fs.readFileSync(file3, 'utf8');
const lines3 = content3.split('\n');
if (lines3.length > 402) {
    lines3[402] = lines3[402].replace(/[^\w\s,.:;{}()\[\]"\'=<>!@#$%^&*|\\/\\-]/g, '');
    fs.writeFileSync(file3, lines3.join('\n'), 'utf8');
    console.log('Fixed RegistroAcademico line 403');
}

console.log('Done fixing syntax errors.');