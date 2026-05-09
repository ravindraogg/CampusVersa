const express = require('express');
const { getAllSchemas } = require('../schemaReader');

const router = express.Router();

/**
 * Analyze relationships between schemas
 * @param {Object} schemas - All schema objects
 * @returns {Object} Relationship analysis
 */
function analyzeRelationships(schemas) {
  const relationships = {};
  
  for (const modelName in schemas) {
    const model = schemas[modelName];
    relationships[modelName] = {
      references: [],
      referencedBy: [],
      fieldTypes: {}
    };
    
    // Analyze fields for references
    for (const fieldName in model.fields) {
      const fieldType = model.fields[fieldName];
      
      // Track field types
      relationships[modelName].fieldTypes[fieldName] = fieldType;
      
      // Look for references to other models
      for (const targetModelName in schemas) {
        if (targetModelName !== modelName) {
          // Check if field references another model
          if (fieldType.includes(targetModelName) || 
              fieldType.includes(targetModelName.toLowerCase()) ||
              fieldName.includes(targetModelName.toLowerCase()) ||
              (fieldName.includes('Id') && targetModelName.toLowerCase().includes(fieldName.replace('Id', '').toLowerCase()))) {
            relationships[modelName].references.push({
              field: fieldName,
              targetModel: targetModelName,
              type: fieldType
            });
            
            // Add reverse reference
            if (!relationships[targetModelName]) {
              relationships[targetModelName] = {
                references: [],
                referencedBy: [],
                fieldTypes: {}
              };
            }
            relationships[targetModelName].referencedBy.push({
              field: fieldName,
              sourceModel: modelName,
              type: fieldType
            });
          }
        }
      }
    }
  }
  
  return relationships;
}

/**
 * Answer a question based on schema analysis
 * @param {string} question - User question
 * @param {Object} schemas - All schema objects
 * @param {Object} relationships - Analyzed relationships
 * @returns {string} Answer to the question
 */
function answerQuestion(question, schemas, relationships) {
  const lowerQuestion = question.toLowerCase();
  
  // Handle course and assignment related questions
  if ((lowerQuestion.includes('course') || lowerQuestion.includes('study')) && 
      (lowerQuestion.includes('help') || lowerQuestion.includes('assist') || lowerQuestion.includes('material'))) {
    return getCourseStudyAssistance(schemas, relationships);
  }
  
  if ((lowerQuestion.includes('assignment') || lowerQuestion.includes('submit')) && 
      (lowerQuestion.includes('help') || lowerQuestion.includes('how') || lowerQuestion.includes('submit'))) {
    return getAssignmentSubmissionHelp(schemas, relationships);
  }
  
  // Handle specific question patterns
  if (lowerQuestion.includes('faculty') && (lowerQuestion.includes('add') || lowerQuestion.includes('create')) && lowerQuestion.includes('student')) {
    if (relationships.Student && relationships.Student.referencedBy) {
      const facultyRefs = relationships.Student.referencedBy.filter(ref => ref.sourceModel === 'Faculty');
      if (facultyRefs.length > 0) {
        return "Based on the schema analysis, Faculty members can be associated with Students through the facultyId field in the Student schema. However, the actual ability to add students would depend on the application's business logic and permissions.";
      }
    }
    return "Based on the schema analysis, there is no direct relationship that allows Faculty to add Students. The application's business logic would need to implement this functionality.";
  }
  
  if (lowerQuestion.includes('student') && (lowerQuestion.includes('enroll') || lowerQuestion.includes('register')) && lowerQuestion.includes('course')) {
    if (relationships.Course && relationships.Course.referencedBy) {
      const studentRefs = relationships.Course.referencedBy.filter(ref => ref.sourceModel === 'Student');
      if (studentRefs.length > 0) {
        return "Students can enroll in Courses based on the schema relationships. The Student schema has fields that reference Courses, indicating an enrollment mechanism.";
      }
    }
    return "The schema doesn't show a direct enrollment relationship between Students and Courses. This functionality would need to be implemented in the application logic.";
  }
  
  // General schema information requests
  for (const modelName in schemas) {
    if (lowerQuestion.includes(modelName.toLowerCase())) {
      const model = schemas[modelName];
      const fields = Object.keys(model.fields).join(', ');
      
      // Check if this model has relationships
      let relationshipInfo = "";
      if (relationships[modelName]) {
        const refs = relationships[modelName].references;
        const referencedBy = relationships[modelName].referencedBy || [];
        
        if (refs.length > 0 || referencedBy.length > 0) {
          relationshipInfo = " This model has relationships: ";
          if (refs.length > 0) {
            relationshipInfo += `references ${refs.map(r => `${r.targetModel} through ${r.field}`).join(', ')}; `;
          }
          if (referencedBy.length > 0) {
            relationshipInfo += `referenced by ${referencedBy.map(r => `${r.sourceModel} through ${r.field}`).join(', ')}; `;
          }
        }
      }
      
      return `The ${modelName} schema contains the following fields: ${fields}.${relationshipInfo} This schema represents ${getModelDescription(modelName)} in the institute database.`;
    }
  }
  
  // General response about available schemas
  const schemaNames = Object.keys(schemas).join(', ');
  return `I can help you with information about the institute database schemas. The system includes the following schemas: ${schemaNames}. You can ask me specific questions about any of these schemas and I'll provide detailed information.`;
}

/**
 * Provide course study assistance information
 * @param {Object} schemas - All schema objects
 * @param {Object} relationships - Analyzed relationships
 * @returns {string} Course study assistance information
 */
function getCourseStudyAssistance(schemas, relationships) {
  let response = "I can help you with course study materials. ";
  
  // Check if there are course-related schemas
  if (schemas.Course) {
    const courseFields = Object.keys(schemas.Course.fields);
    response += `Courses in our system contain information like: ${courseFields.slice(0, 5).join(', ')}. `;
    
    // Check for resources field
    if (courseFields.includes('resources')) {
      response += "Courses have a 'resources' field which likely contains study materials, lecture notes, and other educational content. ";
    }
  }
  
  // Check for student-course relationships
  if (relationships.Course && relationships.Course.referencedBy) {
    const studentRefs = relationships.Course.referencedBy.filter(ref => ref.sourceModel === 'Student');
    if (studentRefs.length > 0) {
      response += "Students are enrolled in courses, and can access course materials through the system. ";
    }
  }
  
  response += "You can ask specific questions about any course or subject to get more targeted help.";
  return response;
}

/**
 * Provide assignment submission help
 * @param {Object} schemas - All schema objects
 * @param {Object} relationships - Analyzed relationships
 * @returns {string} Assignment submission help information
 */
function getAssignmentSubmissionHelp(schemas, relationships) {
  let response = "I can help you with assignment submissions. ";
  
  // Check if there are assignment-related fields in any schema
  let foundAssignmentFields = false;
  
  for (const modelName in schemas) {
    const model = schemas[modelName];
    const fields = Object.keys(model.fields);
    
    // Look for assignment-related fields
    const assignmentFields = fields.filter(field => 
      field.toLowerCase().includes('assignment') || 
      field.toLowerCase().includes('submission') ||
      field.toLowerCase().includes('homework')
    );
    
    if (assignmentFields.length > 0) {
      foundAssignmentFields = true;
      response += `The ${modelName} schema contains assignment-related fields: ${assignmentFields.join(', ')}. `;
    }
  }
  
  // Check for student-course relationships that might involve assignments
  if (relationships.Course && relationships.Course.referencedBy) {
    const studentRefs = relationships.Course.referencedBy.filter(ref => ref.sourceModel === 'Student');
    if (studentRefs.length > 0) {
      response += "Students can submit assignments through their course enrollment. ";
    }
  }
  
  if (!foundAssignmentFields) {
    response += "Based on the current schema structure, specific assignment submission fields aren't clearly defined. " +
                "Assignments are typically managed through course enrollments and may involve uploading files or entering answers in the system. ";
  }
  
  response += "You can ask about specific courses or subjects to get more detailed information about assignments.";
  return response;
}

/**
 * Get description for a model
 * @param {string} modelName - Name of the model
 * @returns {string} Description of the model
 */
function getModelDescription(modelName) {
  const descriptions = {
    'Faculty': 'faculty members with their personal and professional information',
    'Student': 'students with their academic and personal information',
    'Course': 'courses offered by the institute',
    'Institute': 'institute information and accreditation details',
    'Department': 'departments within the institute',
    'default': 'information in the institute database'
  };
  
  return descriptions[modelName] || descriptions['default'];
}

/**
 * GET /api/schema
 * Returns schema information for all model files with relationship analysis
 */
router.get('/', (req, res) => {
  try {
    const schemas = getAllSchemas();
    const relationships = analyzeRelationships(schemas);
    
    res.json({
      success: true,
      schemas,
      relationships,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve schema information',
      message: error.message
    });
  }
});

/**
 * GET /api/schema/:modelName
 * Returns schema information for a specific model
 */
router.get('/:modelName', (req, res) => {
  try {
    const modelName = req.params.modelName;
    const schemas = getAllSchemas();
    const relationships = analyzeRelationships(schemas);
    
    if (schemas[modelName]) {
      res.json({
        success: true,
        schema: schemas[modelName],
        relationships: relationships[modelName] || {},
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(404).json({
        success: false,
        error: `Schema for model '${modelName}' not found`
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve schema information',
      message: error.message
    });
  }
});

/**
 * POST /api/schema/ask
 * Answer a question based on schema analysis
 */
router.post('/ask', (req, res) => {
  try {
    const { question } = req.body;
    
    if (!question) {
      return res.status(400).json({
        success: false,
        error: 'Question is required'
      });
    }
    
    const schemas = getAllSchemas();
    const relationships = analyzeRelationships(schemas);
    const answer = answerQuestion(question, schemas, relationships);
    
    res.json({
      success: true,
      question,
      answer,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to process question',
      message: error.message
    });
  }
});

module.exports = router;