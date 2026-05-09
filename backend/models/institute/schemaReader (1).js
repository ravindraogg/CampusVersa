const fs = require('fs');
const path = require('path');

/**
 * Reads and parses schema information from JavaScript model files
 * @param {string} filePath - Path to the model file
 * @returns {Object} Parsed schema information
 */
function readSchemaFile(filePath) {
  try {
    // Read the file content
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Extract schema definition (simplified approach)
    // This looks for the mongoose schema definition pattern
    const schemaMatch = content.match(/new mongoose\.Schema\(\s*({[\s\S]*?})\s*\)/);
    
    if (!schemaMatch) {
      return { error: 'Could not find schema definition in file' };
    }
    
    // Extract model name from module.exports line
    const modelNameMatch = content.match(/module\.exports\s*=\s*mongoose\.model\(\s*['"]([^'"]+)['"]/);
    const modelName = modelNameMatch ? modelNameMatch[1] : path.basename(filePath, '.js');
    
    // Simplified parsing of schema fields
    // In a production environment, you might want to use a proper JS parser
    const schemaFields = parseSchemaFields(schemaMatch[1]);
    
    return {
      modelName,
      fields: schemaFields,
      filePath
    };
  } catch (error) {
    return { error: `Failed to read schema file: ${error.message}` };
  }
}

/**
 * Parses schema fields from schema object string
 * @param {string} schemaString - String representation of schema object
 * @returns {Object} Parsed fields
 */
function parseSchemaFields(schemaString) {
  // This is a simplified parser - in a real-world scenario, 
  // you might want to use a proper JavaScript parser
  const fields = {};
  
  // Remove comments and normalize whitespace
  let cleanSchema = schemaString
    .replace(/\/\/.*$/gm, '') // Remove single-line comments
    .replace(/\/\*[\s\S]*?\*\//g, '') // Remove multi-line comments
    .replace(/\s+/g, ' '); // Normalize whitespace
  
  // Extract top-level fields (this is a simplified approach)
  // It looks for patterns like fieldName: { ... } or fieldName: type
  const fieldPattern = /(['"]?)([a-zA-Z_$][a-zA-Z0-9_$]*)(['"]?)\s*:\s*([{[]|[^,}]+?)(?=[,}])/g;
  
  let match;
  while ((match = fieldPattern.exec(cleanSchema)) !== null) {
    const fieldName = match[2];
    const fieldValue = match[4].trim();
    
    // Try to determine the field type
    if (fieldValue.startsWith('{')) {
      // Nested object - try to parse
      fields[fieldName] = parseNestedObject(fieldValue);
    } else if (fieldValue.startsWith('[')) {
      // Array field
      fields[fieldName] = 'Array';
    } else {
      // Simple field
      fields[fieldName] = fieldValue.replace(/[{}]/g, '').trim();
    }
  }
  
  return fields;
}

/**
 * Parses nested object fields
 * @param {string} objString - String representation of nested object
 * @returns {Object|string} Parsed object or simplified representation
 */
function parseNestedObject(objString) {
  // For deeply nested objects, we'll simplify to just indicate it's an object
  // In a more advanced implementation, you could recursively parse nested fields
  if (objString.includes('type:')) {
    // Mongoose schema type definition
    const typeMatch = objString.match(/type:\s*([^{,]+)/);
    return typeMatch ? typeMatch[1].trim() : 'Object';
  }
  
  return 'Object';
}

/**
 * Gets schema information for all model files
 * @returns {Object} Schema information for all models
 */
function getAllSchemas() {
  const schemas = {};
  const modelFiles = [
    'Faculty.js',
    'Student.js',
    'Course.js',
    'Institute.js',
    'Department.js',
    'DepartmentMetric.js',
    'Notice.js',
    'Timetable.js',
    'NAACTracker.js',
    'NIRFStats.js',
    'Attendance.js',
    'FacultySSR.js',
    'FacultyForm.js',
    'FacultyFormResponse.js',
    'Aadhaar.js'
  ];
  
  // Try to read each model file from both current directory and models subdirectories
  for (const fileName of modelFiles) {
    // First check current directory
    let filePath = path.join(__dirname, fileName);
    
    // If not found, check in models/institute directory
    if (!fs.existsSync(filePath)) {
      filePath = path.join(__dirname, 'models', 'institute', fileName);
    }
    
    // If not found, check in models/admin directory
    if (!fs.existsSync(filePath)) {
      filePath = path.join(__dirname, 'models', 'admin', fileName);
    }
    
    // Check if file exists
    if (fs.existsSync(filePath)) {
      const schemaInfo = readSchemaFile(filePath);
      if (!schemaInfo.error) {
        schemas[schemaInfo.modelName] = schemaInfo;
      }
    }
  }
  
  return schemas;
}

module.exports = {
  readSchemaFile,
  getAllSchemas
};