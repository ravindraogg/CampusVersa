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
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const UnifiedResumeBuilder = () => {
  // Refs
  const resumeRef = useRef();
  
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
    // In a real app, this would open a preview modal
    alert('Preview functionality would open here');
  };

  const handleSave = () => {
    // In a real app, this would save to a database
    alert('Resume saved successfully!');
  };

  const handleDownload = async () => {
    const element = resumeRef.current;
    
    try {
      // Generate canvas from the resume preview
      const canvas = await html2canvas(element);
      const imgData = canvas.toDataURL('image/png');
      
      // Calculate dimensions for PDF
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 295; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Create PDF
      const pdf = new jsPDF('p', 'mm');
      let heightLeft = imgHeight;
      let position = 0;
      
      // Add image to PDF
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      // Add additional pages if needed
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      // Save PDF
      pdf.save(`${resumeData.personalInfo.fullName || 'resume'}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-8xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-3xl shadow-sm p-6 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">AI Resume Builder</h1>
              <p className="text-gray-600 mt-2">Create a professional resume with AI assistance</p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={handlePreview}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
              >
                <Eye className="w-4 h-4" />
                Preview
              </button>
              <button 
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors"
              >
                <Save className="w-4 h-4" />
                Save
              </button>
              <button 
                onClick={handleDownload}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                Download PDF
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Form Section - Left Side */}
          <div className="lg:w-1/2 space-y-8">
            {/* Personal Information */}
            <div className="bg-white rounded-3xl shadow-sm p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-100 rounded-full">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-800">Personal Information</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={resumeData.personalInfo.fullName}
                    onChange={(e) => handlePersonalInfoChange('fullName', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="John Doe"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={resumeData.personalInfo.email}
                    onChange={(e) => handlePersonalInfoChange('email', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="john@example.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={resumeData.personalInfo.phone}
                    onChange={(e) => handlePersonalInfoChange('phone', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <input
                    type="text"
                    value={resumeData.personalInfo.location}
                    onChange={(e) => handlePersonalInfoChange('location', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="City, Country"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn</label>
                  <input
                    type="text"
                    value={resumeData.personalInfo.linkedin}
                    onChange={(e) => handlePersonalInfoChange('linkedin', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="linkedin.com/in/username"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">GitHub</label>
                  <input
                    type="text"
                    value={resumeData.personalInfo.github}
                    onChange={(e) => handlePersonalInfoChange('github', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="github.com/username"
                  />
                </div>
              </div>
            </div>

            {/* Professional Summary */}
            <div className="bg-white rounded-3xl shadow-sm p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-purple-100 rounded-full">
                  <Edit3 className="w-5 h-5 text-purple-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-800">Professional Summary</h2>
              </div>
              
              <textarea
                value={resumeData.summary}
                onChange={(e) => handleSummaryChange(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="Write a brief summary about your professional background, key skills, and career goals..."
              />
            </div>

            {/* Work Experience */}
            <div className="bg-white rounded-3xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-full">
                    <Briefcase className="w-5 h-5 text-orange-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">Work Experience</h2>
                </div>
                <button 
                  onClick={addExperience}
                  className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors"
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
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Job Title</label>
                      <input
                        type="text"
                        value={exp.jobTitle}
                        onChange={(e) => updateExperience(exp.id, 'jobTitle', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        placeholder="Software Engineer"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
                      <input
                        type="text"
                        value={exp.company}
                        onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        placeholder="Company Name"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                      <input
                        type="month"
                        value={exp.startDate}
                        onChange={(e) => updateExperience(exp.id, 'startDate', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                      <input
                        type="month"
                        value={exp.endDate}
                        onChange={(e) => updateExperience(exp.id, 'endDate', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        placeholder="Present"
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                      <textarea
                        value={exp.description}
                        onChange={(e) => updateExperience(exp.id, 'description', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        placeholder="Describe your responsibilities and achievements..."
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Education */}
            <div className="bg-white rounded-3xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 rounded-full">
                    <GraduationCap className="w-5 h-5 text-indigo-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">Education</h2>
                </div>
                <button 
                  onClick={addEducation}
                  className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors"
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
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Degree</label>
                      <input
                        type="text"
                        value={edu.degree}
                        onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Bachelor of Science in Computer Science"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Institution</label>
                      <input
                        type="text"
                        value={edu.institution}
                        onChange={(e) => updateEducation(edu.id, 'institution', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="University Name"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                      <input
                        type="month"
                        value={edu.startDate}
                        onChange={(e) => updateEducation(edu.id, 'startDate', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                      <input
                        type="month"
                        value={edu.endDate}
                        onChange={(e) => updateEducation(edu.id, 'endDate', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Present"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Grade/GPA</label>
                      <input
                        type="text"
                        value={edu.grade}
                        onChange={(e) => updateEducation(edu.id, 'grade', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="3.8 GPA"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Skills */}
            <div className="bg-white rounded-3xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-teal-100 rounded-full">
                    <Award className="w-5 h-5 text-teal-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">Skills</h2>
                </div>
                <button 
                  onClick={addSkill}
                  className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Skill
                </button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {resumeData.skills.map((skill, index) => (
                  <div key={index} className="flex items-center bg-gray-100 rounded-full px-3 py-1">
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

            {/* Certifications */}
            <div className="bg-white rounded-3xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-100 rounded-full">
                    <Award className="w-5 h-5 text-yellow-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">Certifications</h2>
                </div>
                <button 
                  onClick={addCertification}
                  className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Certification
                </button>
              </div>
              
              {resumeData.certifications.map((cert, index) => (
                <div key={cert.id} className="mb-6 p-4 border border-gray-200 rounded-2xl last:mb-0">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-medium text-gray-800">Certification #{index + 1}</h3>
                    {resumeData.certifications.length > 1 && (
                      <button 
                        onClick={() => removeCertification(cert.id)}
                        className="p-1 text-red-500 hover:bg-red-50 rounded-full"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Certification Name</label>
                      <input
                        type="text"
                        value={cert.name}
                        onChange={(e) => updateCertification(cert.id, 'name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                        placeholder="AWS Certified Solutions Architect"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Issuer</label>
                      <input
                        type="text"
                        value={cert.issuer}
                        onChange={(e) => updateCertification(cert.id, 'issuer', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                        placeholder="Amazon Web Services"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                      <input
                        type="month"
                        value={cert.date}
                        onChange={(e) => updateCertification(cert.id, 'date', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Projects */}
            <div className="bg-white rounded-3xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-full">
                    <Briefcase className="w-5 h-5 text-purple-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">Projects</h2>
                </div>
                <button 
                  onClick={addProject}
                  className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Project
                </button>
              </div>
              
              {resumeData.projects.map((project, index) => (
                <div key={project.id} className="mb-6 p-4 border border-gray-200 rounded-2xl last:mb-0">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-medium text-gray-800">Project #{index + 1}</h3>
                    {resumeData.projects.length > 1 && (
                      <button 
                        onClick={() => removeProject(project.id)}
                        className="p-1 text-red-500 hover:bg-red-50 rounded-full"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Project Name</label>
                      <input
                        type="text"
                        value={project.name}
                        onChange={(e) => updateProject(project.id, 'name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        placeholder="E-commerce Website"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                      <textarea
                        value={project.description}
                        onChange={(e) => updateProject(project.id, 'description', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        placeholder="Describe the project, your role, and the technologies used..."
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Technologies</label>
                      <input
                        type="text"
                        value={project.technologies}
                        onChange={(e) => updateProject(project.id, 'technologies', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        placeholder="React, Node.js, MongoDB"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Link</label>
                      <input
                        type="text"
                        value={project.link}
                        onChange={(e) => updateProject(project.id, 'link', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        placeholder="https://project-link.com"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Achievements */}
            <div className="bg-white rounded-3xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-100 rounded-full">
                    <Award className="w-5 h-5 text-yellow-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">Achievements</h2>
                </div>
                <button 
                  onClick={addAchievement}
                  className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Achievement
                </button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {resumeData.achievements.map((achievement, index) => (
                  <div key={index} className="flex items-center bg-gray-100 rounded-full px-3 py-1">
                    <input
                      type="text"
                      value={achievement}
                      onChange={(e) => handleAchievementsChange(index, e.target.value)}
                      className="bg-transparent border-none focus:ring-0 p-0 text-sm w-full"
                      placeholder="Add an achievement"
                    />
                    <button 
                      onClick={() => removeAchievement(index)}
                      className="ml-2 text-gray-500 hover:text-red-500"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Preview Section - Right Side */}
          <div className="lg:w-1/2">
            <div className="bg-white rounded-3xl shadow-sm p-6 sticky top-8">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Live Preview</h2>
              
              {/* Resume Preview Card */}
              <div ref={resumeRef} className="bg-white border border-gray-300 rounded-2xl p-8 min-h-[800px]">
                {/* Personal Info Preview */}
                <div className="text-center mb-8">
                  <h1 className="text-3xl font-bold text-gray-800">
                    {resumeData.personalInfo.fullName || 'Your Name'}
                  </h1>
                  <div className="flex flex-wrap justify-center gap-4 mt-3 text-gray-600">
                    {resumeData.personalInfo.email && (
                      <span className="flex items-center">
                        <Mail className="w-4 h-4 mr-1" />
                        {resumeData.personalInfo.email}
                      </span>
                    )}
                    {resumeData.personalInfo.phone && (
                      <span className="flex items-center">
                        <Phone className="w-4 h-4 mr-1" />
                        {resumeData.personalInfo.phone}
                      </span>
                    )}
                    {resumeData.personalInfo.location && (
                      <span className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {resumeData.personalInfo.location}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap justify-center gap-4 mt-2 text-gray-600">
                    {resumeData.personalInfo.linkedin && (
                      <span>LinkedIn: {resumeData.personalInfo.linkedin}</span>
                    )}
                    {resumeData.personalInfo.github && (
                      <span>GitHub: {resumeData.personalInfo.github}</span>
                    )}
                  </div>
                </div>

                {/* Summary Preview */}
                <div className="mb-8">
                  <h2 className="text-xl font-bold text-gray-800 border-b-2 border-gray-200 pb-1 mb-3">
                    Professional Summary
                  </h2>
                  <p className="text-gray-700">
                    {resumeData.summary || 'A brief summary of your professional background, key skills, and career goals.'}
                  </p>
                </div>

                {/* Experience Preview */}
                <div className="mb-8">
                  <h2 className="text-xl font-bold text-gray-800 border-b-2 border-gray-200 pb-1 mb-3">
                    Work Experience
                  </h2>
                  {resumeData.experience.map((exp, index) => (
                    <div key={index} className="mb-4">
                      <div className="flex justify-between">
                        <h3 className="font-bold text-gray-800">
                          {exp.jobTitle || 'Job Title'}
                        </h3>
                        <span className="text-gray-600">
                          {formatDateRange(exp.startDate, exp.endDate)}
                        </span>
                      </div>
                      {exp.company && (
                        <p className="text-gray-700 font-medium">{exp.company}</p>
                      )}
                      {exp.description && (
                        <p className="text-gray-600 mt-1">{exp.description}</p>
                      )}
                    </div>
                  ))}
                </div>

                {/* Education Preview */}
                <div className="mb-8">
                  <h2 className="text-xl font-bold text-gray-800 border-b-2 border-gray-200 pb-1 mb-3">
                    Education
                  </h2>
                  {resumeData.education.map((edu, index) => (
                    <div key={index} className="mb-3">
                      <div className="flex justify-between">
                        <h3 className="font-bold text-gray-800">
                          {edu.degree || 'Degree'}
                        </h3>
                        <span className="text-gray-600">
                          {formatDateRange(edu.startDate, edu.endDate)}
                        </span>
                      </div>
                      {edu.institution && (
                        <p className="text-gray-700 font-medium">{edu.institution}</p>
                      )}
                      {edu.grade && (
                        <p className="text-gray-600">{edu.grade}</p>
                      )}
                    </div>
                  ))}
                </div>

                {/* Skills Preview */}
                <div className="mb-8">
                  <h2 className="text-xl font-bold text-gray-800 border-b-2 border-gray-200 pb-1 mb-3">
                    Skills
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {resumeData.skills.map((skill, index) => (
                      <span 
                        key={index} 
                        className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                      >
                        {skill || 'Skill ' + (index + 1)}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Certifications Preview */}
                <div>
                  <h2 className="text-xl font-bold text-gray-800 border-b-2 border-gray-200 pb-1 mb-3">
                    Certifications
                  </h2>
                  {resumeData.certifications.map((cert, index) => (
                    <div key={index} className="mb-2">
                      <div className="flex justify-between">
                        <h3 className="font-bold text-gray-800">
                          {cert.name || 'Certification Name'}
                        </h3>
                        {cert.date && (
                          <span className="text-gray-600">
                            {new Date(cert.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
                          </span>
                        )}
                      </div>
                      {cert.issuer && (
                        <p className="text-gray-700">{cert.issuer}</p>
                      )}
                    </div>
                  ))}
                </div>

                {/* Projects Preview */}
                <div className="mb-8">
                  <h2 className="text-xl font-bold text-gray-800 border-b-2 border-gray-200 pb-1 mb-3">
                    Projects
                  </h2>
                  {resumeData.projects.map((project, index) => (
                    <div key={index} className="mb-4">
                      <div className="flex justify-between items-start">
                        <h3 className="font-bold text-gray-800">
                          {project.name || 'Project Name'}
                        </h3>
                        {project.link && (
                          <a href={project.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                            Link
                          </a>
                        )}
                      </div>
                      {project.technologies && (
                        <p className="text-gray-600 text-sm mt-1">{project.technologies}</p>
                      )}
                      {project.description && (
                        <p className="text-gray-700 mt-2">{project.description}</p>
                      )}
                    </div>
                  ))}
                </div>

                {/* Achievements Preview */}
                <div>
                  <h2 className="text-xl font-bold text-gray-800 border-b-2 border-gray-200 pb-1 mb-3">
                    Achievements
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {resumeData.achievements.map((achievement, index) => (
                      achievement && (
                        <span 
                          key={index} 
                          className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm"
                        >
                          {achievement}
                        </span>
                      )
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="font-medium text-gray-800 mb-3">Tips for a great resume:</h3>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li className="flex items-start">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5 mr-2"></div>
                    <span>Use action verbs to describe your experiences</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5 mr-2"></div>
                    <span>Quantify your achievements with numbers</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5 mr-2"></div>
                    <span>Keep your resume to one page if possible</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5 mr-2"></div>
                    <span>Customize for each job application</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnifiedResumeBuilder;