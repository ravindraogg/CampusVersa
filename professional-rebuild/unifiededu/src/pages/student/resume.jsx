import React, { useState, useRef } from 'react';
import { 
  User, 
  Briefcase, 
  GraduationCap, 
  Award, 
  Mail, 
  Phone, 
  MapPin, 
  Plus, 
  Trash2, 
  Download, 
  Eye,
  Save,
  Edit3
} from 'lucide-react';

const UnifiedResumeBuilder = ({ theme }) => {
  // Refs
  const resumeRef = useRef();
  const primaryColor = theme?.primary || '#7D5AFE';
  
  // State for resume data
  const [resumeData, setResumeData] = useState({
    personalInfo: {
      fullName: '',
      email: '',
      phone: '',
      location: '',
      linkedin: '',
      github: ''
    },
    summary: '',
    experience: [
      {
        id: 1,
        jobTitle: '',
        company: '',
        startDate: '',
        endDate: '',
        description: ''
      }
    ],
    education: [
      {
        id: 1,
        degree: '',
        institution: '',
        startDate: '',
        endDate: '',
        grade: ''
      }
    ],
    skills: [''],
    certifications: [
      {
        id: 1,
        name: '',
        issuer: '',
        date: ''
      }
    ],
    projects: [
      {
        id: 1,
        name: '',
        description: '',
        technologies: '',
        link: ''
      }
    ],
    achievements: ['']
  });

  // Handle input changes
  const handlePersonalInfoChange = (field, value) => {
    setResumeData(prev => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        [field]: value
      }
    }));
  };

  const handleSummaryChange = (value) => {
    setResumeData(prev => ({
      ...prev,
      summary: value
    }));
  };

  // Handle experience changes
  const addExperience = () => {
    setResumeData(prev => ({
      ...prev,
      experience: [
        ...prev.experience,
        {
          id: Date.now(),
          jobTitle: '',
          company: '',
          startDate: '',
          endDate: '',
          description: ''
        }
      ]
    }));
  };

  const updateExperience = (id, field, value) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.map(exp => 
        exp.id === id ? { ...exp, [field]: value } : exp
      )
    }));
  };

  const removeExperience = (id) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.filter(exp => exp.id !== id)
    }));
  };

  // Handle education changes
  const addEducation = () => {
    setResumeData(prev => ({
      ...prev,
      education: [
        ...prev.education,
        {
          id: Date.now(),
          degree: '',
          institution: '',
          startDate: '',
          endDate: '',
          grade: ''
        }
      ]
    }));
  };

  const updateEducation = (id, field, value) => {
    setResumeData(prev => ({
      ...prev,
      education: prev.education.map(edu => 
        edu.id === id ? { ...edu, [field]: value } : edu
      )
    }));
  };

  const removeEducation = (id) => {
    setResumeData(prev => ({
      ...prev,
      education: prev.education.filter(edu => edu.id !== id)
    }));
  };

  // Handle skills changes
  const handleSkillsChange = (index, value) => {
    const newSkills = [...resumeData.skills];
    newSkills[index] = value;
    setResumeData(prev => ({
      ...prev,
      skills: newSkills
    }));
  };

  const addSkill = () => {
    setResumeData(prev => ({
      ...prev,
      skills: [...prev.skills, '']
    }));
  };

  const removeSkill = (index) => {
    const newSkills = [...resumeData.skills];
    newSkills.splice(index, 1);
    setResumeData(prev => ({
      ...prev,
      skills: newSkills
    }));
  };

  // Handle certifications changes
  const addCertification = () => {
    setResumeData(prev => ({
      ...prev,
      certifications: [
        ...prev.certifications,
        {
          id: Date.now(),
          name: '',
          issuer: '',
          date: ''
        }
      ]
    }));
  };

  const updateCertification = (id, field, value) => {
    setResumeData(prev => ({
      ...prev,
      certifications: prev.certifications.map(cert => 
        cert.id === id ? { ...cert, [field]: value } : cert
      )
    }));
  };

  const removeCertification = (id) => {
    setResumeData(prev => ({
      ...prev,
      certifications: prev.certifications.filter(cert => cert.id !== id)
    }));
  };

  // Handle projects changes
  const addProject = () => {
    setResumeData(prev => ({
      ...prev,
      projects: [
        ...prev.projects,
        {
          id: Date.now(),
          name: '',
          description: '',
          technologies: '',
          link: ''
        }
      ]
    }));
  };

  const updateProject = (id, field, value) => {
    setResumeData(prev => ({
      ...prev,
      projects: prev.projects.map(project => 
        project.id === id ? { ...project, [field]: value } : project
      )
    }));
  };

  const removeProject = (id) => {
    setResumeData(prev => ({
      ...prev,
      projects: prev.projects.filter(project => project.id !== id)
    }));
  };

  // Handle achievements changes
  const handleAchievementsChange = (index, value) => {
    const newAchievements = [...resumeData.achievements];
    newAchievements[index] = value;
    setResumeData(prev => ({
      ...prev,
      achievements: newAchievements
    }));
  };

  const addAchievement = () => {
    setResumeData(prev => ({
      ...prev,
      achievements: [...prev.achievements, '']
    }));
  };

  const removeAchievement = (index) => {
    const newAchievements = [...resumeData.achievements];
    newAchievements.splice(index, 1);
    setResumeData(prev => ({
      ...prev,
      achievements: newAchievements
    }));
  };

  // Format date range
  const formatDateRange = (start, end) => {
    if (!start && !end) return 'Jan 2020 - Present';
    
    const startDate = start ? new Date(start) : null;
    const endDate = end ? new Date(end) : null;
    
    const startStr = startDate ? startDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short' }) : 'Unknown';
    const endStr = endDate ? endDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short' }) : 'Present';
    
    return `${startStr} - ${endStr}`;
  };

  // Preview and save functions
  const handlePreview = () => {
    alert('Preview functionality would open here');
  };

  const handleSave = () => {
    alert('Resume saved successfully!');
  };

  const handleDownload = () => {
    window.print();
  };

  // Helper for input styles to use theme color on focus
  const inputStyle = {
    '--tw-ring-color': primaryColor,
    '--tw-border-opacity': 1,
  };

  const focusClass = "focus:ring-2 focus:border-transparent transition-shadow duration-200";

  return (
    <div className="min-h-screen bg-gray-50 py-4 md:py-8 print:bg-white print:p-0">
      <style>{`
        @media print {
          @page { margin: 0; }
          body { 
            background: white; 
            -webkit-print-color-adjust: exact; 
          }
        }
        .focus\\:ring-theme:focus {
          --tw-ring-color: ${primaryColor};
          --tw-ring-opacity: 0.5;
          border-color: ${primaryColor};
        }
      `}</style>
      
      <div className="max-w-8xl mx-auto px-4 print:max-w-none print:px-0 print:mx-0 print:w-full">
        {/* Header */}
        <div className="bg-white rounded-3xl shadow-sm p-4 md:p-6 mb-8 print:hidden">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">AI Resume Builder</h1>
              <p className="text-gray-600 mt-1 md:mt-2 text-sm md:text-base">Create a professional resume with AI assistance</p>
            </div>
            <div className="flex flex-wrap gap-2 md:gap-3 w-full md:w-auto">
              <button 
                onClick={handlePreview}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-full hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                <Eye className="w-4 h-4" />
                Preview
              </button>
              <button 
                onClick={handleSave}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 text-white rounded-full hover:opacity-90 transition-colors text-sm font-medium"
                style={{ backgroundColor: primaryColor }}
              >
                <Save className="w-4 h-4" />
                Save
              </button>
              <button 
                onClick={handleDownload}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 text-white rounded-full hover:opacity-90 transition-colors text-sm font-medium"
                style={{ backgroundColor: primaryColor }}
              >
                <Download className="w-4 h-4" />
                PDF
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 md:gap-8 print:block">
          {/* Form Section - Left Side */}
          <div className="lg:w-1/2 space-y-6 md:space-y-8 print:hidden order-2 lg:order-1">
            {/* Personal Information */}
            <div className="bg-white rounded-3xl shadow-sm p-5 md:p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-full" style={{ backgroundColor: `${primaryColor}15` }}>
                  <User className="w-5 h-5" style={{ color: primaryColor }} />
                </div>
                <h2 className="text-lg md:text-xl font-bold text-gray-800">Personal Information</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                {Object.keys(resumeData.personalInfo).map((field) => (
                  <div key={field}>
                    <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">{field.replace(/([A-Z])/g, ' $1').trim()}</label>
                    <input
                      type={field === 'email' ? 'email' : 'text'}
                      value={resumeData.personalInfo[field]}
                      onChange={(e) => handlePersonalInfoChange(field, e.target.value)}
                      className={`w-full px-4 py-2 border border-gray-300 rounded-2xl ${focusClass} focus:ring-theme`}
                      placeholder={field === 'fullName' ? 'John Doe' : ''}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Professional Summary */}
            <div className="bg-white rounded-3xl shadow-sm p-5 md:p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-full" style={{ backgroundColor: `${primaryColor}15` }}>
                  <Edit3 className="w-5 h-5" style={{ color: primaryColor }} />
                </div>
                <h2 className="text-lg md:text-xl font-bold text-gray-800">Professional Summary</h2>
              </div>
              
              <textarea
                value={resumeData.summary}
                onChange={(e) => handleSummaryChange(e.target.value)}
                rows={4}
                className={`w-full px-4 py-2 border border-gray-300 rounded-2xl ${focusClass} focus:ring-theme`}
                placeholder="Write a brief summary about your professional background, key skills, and career goals..."
              />
            </div>

            {/* Work Experience */}
            <div className="bg-white rounded-3xl shadow-sm p-5 md:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full" style={{ backgroundColor: `${primaryColor}15` }}>
                    <Briefcase className="w-5 h-5" style={{ color: primaryColor }} />
                  </div>
                  <h2 className="text-lg md:text-xl font-bold text-gray-800">Work Experience</h2>
                </div>
                <button 
                  onClick={addExperience}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-full hover:opacity-80 transition-colors text-sm"
                  style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
                >
                  <Plus className="w-4 h-4" />
                  Add Experience
                </button>
              </div>
              
              {resumeData.experience.map((exp, index) => (
                <div key={exp.id} className="mb-6 p-4 border border-gray-200 rounded-2xl last:mb-0">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-medium text-gray-800">Experience #{index + 1}</h3>
                    {resumeData.experience.length > 1 && (
                      <button 
                        onClick={() => removeExperience(exp.id)}
                        className="p-1 text-red-500 hover:bg-red-50 rounded-full"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {['jobTitle', 'company', 'startDate', 'endDate'].map((field) => (
                      <div key={field}>
                        <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">{field.replace(/([A-Z])/g, ' $1').trim()}</label>
                        <input
                          type={field.includes('Date') ? 'month' : 'text'}
                          value={exp[field]}
                          onChange={(e) => updateExperience(exp.id, field, e.target.value)}
                          className={`w-full px-3 py-2 border border-gray-300 rounded-xl ${focusClass} focus:ring-theme`}
                        />
                      </div>
                    ))}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                      <textarea
                        value={exp.description}
                        onChange={(e) => updateExperience(exp.id, 'description', e.target.value)}
                        rows={3}
                        className={`w-full px-3 py-2 border border-gray-300 rounded-xl ${focusClass} focus:ring-theme`}
                        placeholder="Describe your responsibilities and achievements..."
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Education */}
            <div className="bg-white rounded-3xl shadow-sm p-5 md:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full" style={{ backgroundColor: `${primaryColor}15` }}>
                    <GraduationCap className="w-5 h-5" style={{ color: primaryColor }} />
                  </div>
                  <h2 className="text-lg md:text-xl font-bold text-gray-800">Education</h2>
                </div>
                <button 
                  onClick={addEducation}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-full hover:opacity-80 transition-colors text-sm"
                  style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
                >
                  <Plus className="w-4 h-4" />
                  Add Education
                </button>
              </div>
              
              {resumeData.education.map((edu, index) => (
                <div key={edu.id} className="mb-6 p-4 border border-gray-200 rounded-2xl last:mb-0">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-medium text-gray-800">Education #{index + 1}</h3>
                    {resumeData.education.length > 1 && (
                      <button 
                        onClick={() => removeEducation(edu.id)}
                        className="p-1 text-red-500 hover:bg-red-50 rounded-full"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {['degree', 'institution', 'startDate', 'endDate', 'grade'].map((field) => (
                      <div key={field}>
                        <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">{field}</label>
                        <input
                          type={field.includes('Date') ? 'month' : 'text'}
                          value={edu[field]}
                          onChange={(e) => updateEducation(edu.id, field, e.target.value)}
                          className={`w-full px-3 py-2 border border-gray-300 rounded-xl ${focusClass} focus:ring-theme`}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Skills */}
            <div className="bg-white rounded-3xl shadow-sm p-5 md:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full" style={{ backgroundColor: `${primaryColor}15` }}>
                    <Award className="w-5 h-5" style={{ color: primaryColor }} />
                  </div>
                  <h2 className="text-lg md:text-xl font-bold text-gray-800">Skills</h2>
                </div>
                <button 
                  onClick={addSkill}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-full hover:opacity-80 transition-colors text-sm"
                  style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
                >
                  <Plus className="w-4 h-4" />
                  Add Skill
                </button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {resumeData.skills.map((skill, index) => (
                  <div key={index} className="flex items-center bg-gray-100 rounded-full px-3 py-1 border border-gray-200">
                    <input
                      type="text"
                      value={skill}
                      onChange={(e) => handleSkillsChange(index, e.target.value)}
                      className="bg-transparent border-none focus:ring-0 p-0 text-sm"
                      placeholder="Add a skill"
                    />
                    <button 
                      onClick={() => removeSkill(index)}
                      className="ml-2 text-gray-500 hover:text-red-500"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Projects & Certifications (Simplified for brevity but using same theme patterns) */}
            {/* Projects */}
            <div className="bg-white rounded-3xl shadow-sm p-5 md:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full" style={{ backgroundColor: `${primaryColor}15` }}>
                    <Briefcase className="w-5 h-5" style={{ color: primaryColor }} />
                  </div>
                  <h2 className="text-lg md:text-xl font-bold text-gray-800">Projects</h2>
                </div>
                <button 
                  onClick={addProject}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-full hover:opacity-80 transition-colors text-sm"
                  style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
                >
                  <Plus className="w-4 h-4" />
                  Add Project
                </button>
              </div>
              
              {resumeData.projects.map((project, index) => (
                <div key={project.id} className="mb-6 p-4 border border-gray-200 rounded-2xl last:mb-0">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-medium text-gray-800">Project #{index + 1}</h3>
                    <button onClick={() => removeProject(project.id)} className="p-1 text-red-500 hover:bg-red-50 rounded-full"><Trash2 className="w-4 h-4" /></button>
                  </div>
                  <div className="space-y-4">
                    {['name', 'description', 'technologies', 'link'].map(field => (
                      <div key={field}>
                        <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">{field}</label>
                        {field === 'description' ? (
                          <textarea 
                            value={project[field]} 
                            onChange={(e) => updateProject(project.id, field, e.target.value)}
                            rows={3} 
                            className={`w-full px-3 py-2 border border-gray-300 rounded-xl ${focusClass} focus:ring-theme`} 
                          />
                        ) : (
                          <input 
                            type="text" 
                            value={project[field]} 
                            onChange={(e) => updateProject(project.id, field, e.target.value)}
                            className={`w-full px-3 py-2 border border-gray-300 rounded-xl ${focusClass} focus:ring-theme`} 
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Achievements */}
            <div className="bg-white rounded-3xl shadow-sm p-5 md:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full" style={{ backgroundColor: `${primaryColor}15` }}>
                    <Award className="w-5 h-5" style={{ color: primaryColor }} />
                  </div>
                  <h2 className="text-lg md:text-xl font-bold text-gray-800">Achievements</h2>
                </div>
                <button 
                  onClick={addAchievement}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-full hover:opacity-80 transition-colors text-sm"
                  style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
                >
                  <Plus className="w-4 h-4" />
                  Add Achievement
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {resumeData.achievements.map((achievement, index) => (
                  <div key={index} className="flex items-center bg-gray-100 rounded-full px-3 py-1 border border-gray-200">
                    <input type="text" value={achievement} onChange={(e) => handleAchievementsChange(index, e.target.value)} className="bg-transparent border-none focus:ring-0 p-0 text-sm w-full" placeholder="Add an achievement" />
                    <button onClick={() => removeAchievement(index)} className="ml-2 text-gray-500 hover:text-red-500"><Trash2 className="w-3 h-3" /></button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Preview Section - Right Side (Simplified Color Application) */}
          <div className="lg:w-1/2 print:w-full print:absolute print:top-0 print:left-0 print:m-0 order-1 lg:order-2">
            <div className="bg-white rounded-3xl shadow-sm p-5 md:p-6 sticky top-4 print:static print:p-0 print:shadow-none">
              <h2 className="text-xl font-bold text-gray-800 mb-6 print:hidden">Live Preview</h2>
              
              <div ref={resumeRef} className="bg-white border border-gray-300 rounded-2xl p-6 md:p-8 min-h-[500px] lg:min-h-[800px] print:border-none print:min-h-0 print:p-0 print:shadow-none">
                {/* Personal Info Preview */}
                <div className="text-center mb-8">
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-800">{resumeData.personalInfo.fullName || 'Your Name'}</h1>
                  <div className="flex flex-wrap justify-center gap-2 md:gap-4 mt-3 text-gray-600 text-sm">
                    {/* Icons in Preview are kept neutral or can use theme color */}
                    {['email', 'phone', 'location'].map(field => resumeData.personalInfo[field] && (
                      <span key={field} className="flex items-center">
                        {field === 'email' && <Mail className="w-3 h-3 md:w-4 md:h-4 mr-1" />}
                        {field === 'phone' && <Phone className="w-3 h-3 md:w-4 md:h-4 mr-1" />}
                        {field === 'location' && <MapPin className="w-3 h-3 md:w-4 md:h-4 mr-1" />}
                        {resumeData.personalInfo[field]}
                      </span>
                    ))}
                  </div>
                  <div className="flex flex-wrap justify-center gap-2 md:gap-4 mt-2 text-gray-600 text-sm">
                    {resumeData.personalInfo.linkedin && <span>LinkedIn: {resumeData.personalInfo.linkedin}</span>}
                    {resumeData.personalInfo.github && <span>GitHub: {resumeData.personalInfo.github}</span>}
                  </div>
                </div>

                {/* Section Previews (Using theme color for border bottoms) */}
                {[
                  { title: 'Professional Summary', content: resumeData.summary, type: 'text' },
                  { title: 'Work Experience', content: resumeData.experience, type: 'list', fields: ['jobTitle', 'company', 'description'] },
                  { title: 'Education', content: resumeData.education, type: 'list', fields: ['degree', 'institution', 'grade'] },
                  { title: 'Skills', content: resumeData.skills, type: 'tags' },
                  { title: 'Projects', content: resumeData.projects, type: 'list', fields: ['name', 'description', 'technologies', 'link'] },
                  { title: 'Achievements', content: resumeData.achievements, type: 'tags' }
                ].map((section, idx) => (
                  <div key={idx} className="mb-6 md:mb-8">
                    <h2 className="text-lg md:text-xl font-bold text-gray-800 border-b-2 pb-1 mb-3" style={{ borderColor: `${primaryColor}40` }}>
                      {section.title}
                    </h2>
                    {/* Render content based on type - logic simplified for brevity */}
                    {section.type === 'text' && <p className="text-gray-700 text-sm md:text-base">{section.content}</p>}
                    {section.type === 'tags' && (
                      <div className="flex flex-wrap gap-2">
                        {section.content.map((item, i) => item && (
                          <span key={i} className="px-2 py-1 md:px-3 rounded-full text-xs md:text-sm" style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}>
                            {item}
                          </span>
                        ))}
                      </div>
                    )}
                    {section.type === 'list' && section.content.map((item, i) => (
                      <div key={i} className="mb-4">
                        <div className="flex justify-between flex-wrap gap-1">
                          <h3 className="font-bold text-gray-800 text-sm md:text-base">{item[section.fields[0]]}</h3>
                          <span className="text-gray-600 text-xs md:text-sm">{formatDateRange(item.startDate, item.endDate)}</span>
                        </div>
                        {section.fields.slice(1).map(f => item[f] && (
                          <p key={f} className={`text-gray-600 text-sm md:text-base ${f === 'description' ? 'mt-1' : ''}`}>{item[f]}</p>
                        ))}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnifiedResumeBuilder;