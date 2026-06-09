// backend/src/services/cvParser.js
const { pool } = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

// Import correct de pdf-parse
const pdfParse = require('pdf-parse');

class CVParserService {
  constructor() {
    // Dictionnaire des compétences techniques
    this.technicalSkills = [
      'React', 'React.js', 'ReactJS', 'Angular', 'Vue.js', 'Vue', 'Next.js',
      'JavaScript', 'TypeScript', 'Node.js', 'NodeJS', 'Express.js',
      'Python', 'Django', 'Flask', 'Java', 'Spring Boot', 'PHP', 'Laravel',
      'SQL', 'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Firebase',
      'Docker', 'Kubernetes', 'AWS', 'Azure', 'Git', 'GitHub', 'GitLab',
      'Machine Learning', 'Data Science', 'TensorFlow', 'PyTorch', 'Pandas',
      'React Native', 'Flutter', 'Swift', 'Kotlin', 'HTML5', 'CSS3', 'SASS',
      'Redux', 'GraphQL', 'REST API', 'Jest', 'Cypress', 'Webpack', 'Vite'
    ];

    // Dictionnaire des soft skills
    this.softSkills = [
      'Communication', 'Teamwork', 'Leadership', 'Problem Solving', 'Adaptability',
      'Creativity', 'Time Management', 'Organization', 'Project Management',
      'Critical Thinking', 'Emotional Intelligence', 'Conflict Resolution',
      'Negotiation', 'Presentation', 'Public Speaking', 'Mentoring', 'Coaching'
    ];
  }

  // Extraire le texte d'un fichier PDF
  async extractTextFromPDF(filePath) {
    try {
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdfParse(dataBuffer);
      return data.text;
    } catch (error) {
      console.error('PDF extraction error:', error);
      return '';
    }
  }

  // Extraire le texte d'un fichier DOCX
  async extractTextFromDOCX(filePath) {
    try {
      const mammoth = require('mammoth');
      const result = await mammoth.extractRawText({ path: filePath });
      return result.value;
    } catch (error) {
      console.error('DOCX extraction error:', error);
      return '';
    }
  }

  // Extraire le texte d'un fichier DOC
  async extractTextFromDOC(filePath) {
    try {
      // Pour les fichiers .doc, on peut utiliser textract ou une autre librairie
      // Solution simple: essayer de lire comme texte brut
      const text = fs.readFileSync(filePath, 'utf8');
      return text;
    } catch (error) {
      console.error('DOC extraction error:', error);
      return '';
    }
  }

  // Extraire les compétences techniques
  extractTechnicalSkills(text) {
    const foundSkills = [];
    const lowerText = text.toLowerCase();
    
    for (const skill of this.technicalSkills) {
      if (lowerText.includes(skill.toLowerCase())) {
        foundSkills.push({
          name: skill,
          type: 'technical',
          proficiency: 3,
          detectedFrom: this.getContextAround(text, skill)
        });
      }
    }
    
    // Supprimer les doublons
    const uniqueSkills = [];
    const seen = new Set();
    for (const skill of foundSkills) {
      if (!seen.has(skill.name.toLowerCase())) {
        seen.add(skill.name.toLowerCase());
        uniqueSkills.push(skill);
      }
    }
    
    return uniqueSkills;
  }

  // Extraire les soft skills
  extractSoftSkills(text) {
    const foundSkills = [];
    const lowerText = text.toLowerCase();
    
    for (const skill of this.softSkills) {
      if (lowerText.includes(skill.toLowerCase())) {
        foundSkills.push({
          name: skill,
          type: 'soft',
          proficiency: 3,
          detectedFrom: this.getContextAround(text, skill)
        });
      }
    }
    
    return foundSkills;
  }

  // Récupérer le contexte autour d'un mot
  getContextAround(text, word, windowSize = 100) {
    const index = text.toLowerCase().indexOf(word.toLowerCase());
    if (index === -1) return '';
    const start = Math.max(0, index - windowSize);
    const end = Math.min(text.length, index + word.length + windowSize);
    return text.substring(start, end).trim();
  }

  // Sauvegarder les compétences dans la base de données
  async saveSkillsToDatabase(studentProfileId, skills) {
    const savedSkills = [];
    
    for (const skill of skills) {
      try {
        // Vérifier si la compétence existe déjà
        const [existing] = await pool.execute(
          'SELECT id FROM skills WHERE LOWER(name) = LOWER(?)',
          [skill.name]
        );
        
        let skillId;
        if (existing.length === 0) {
          skillId = uuidv4();
          await pool.execute(
            `INSERT INTO skills (id, name, category, weight) VALUES (?, ?, ?, ?)`,
            [skillId, skill.name, skill.type === 'technical' ? 'TECHNICAL' : 'SOFT', 1.0]
          );
        } else {
          skillId = existing[0].id;
        }
        
        // Vérifier si l'étudiant a déjà cette compétence
        const [hasSkill] = await pool.execute(
          'SELECT id FROM student_skills WHERE student_id = ? AND skill_id = ?',
          [studentProfileId, skillId]
        );
        
        if (hasSkill.length === 0) {
          const studentSkillId = uuidv4();
          await pool.execute(
            `INSERT INTO student_skills (id, student_id, skill_id, proficiency_level, years_of_experience) 
             VALUES (?, ?, ?, ?, ?)`,
            [studentSkillId, studentProfileId, skillId, skill.proficiency || 3, 1]
          );
          savedSkills.push(skill);
        }
      } catch (error) {
        console.error('Error saving skill:', skill.name, error.message);
      }
    }
    
    return savedSkills;
  }

  // Analyser le CV
  async parseCV(filePath, fileType, userId) {
    try {
      // Extraire le texte selon le type de fichier
      let text = '';
      
      if (fileType === 'application/pdf') {
        text = await this.extractTextFromPDF(filePath);
      } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        text = await this.extractTextFromDOCX(filePath);
      } else if (fileType === 'application/msword') {
        text = await this.extractTextFromDOC(filePath);
      } else {
        throw new Error('Format de fichier non supporté');
      }

      if (!text || text.trim().length === 0) {
        throw new Error('Impossible d\'extraire le texte du CV');
      }

      console.log('Texte extrait, longueur:', text.length);
      console.log('Premiers caractères:', text.substring(0, 200));

      // Nettoyer le texte
      const cleanText = text.replace(/\s+/g, ' ').trim();
      
      // Extraire les compétences
      const technicalSkills = this.extractTechnicalSkills(cleanText);
      const softSkills = this.extractSoftSkills(cleanText);
      const allSkills = [...technicalSkills, ...softSkills];

      console.log(`Compétences trouvées: ${technicalSkills.length} techniques, ${softSkills.length} soft`);

      // Récupérer l'ID du profil étudiant
      const [profileRows] = await pool.execute(
        'SELECT id FROM student_profiles WHERE user_id = ?',
        [userId]
      );
      
      const studentProfileId = profileRows[0]?.id;
      
      if (studentProfileId && allSkills.length > 0) {
        const savedSkills = await this.saveSkillsToDatabase(studentProfileId, allSkills);
        console.log(`✅ ${savedSkills.length} compétences sauvegardées`);
      } else if (allSkills.length === 0) {
        console.log('Aucune compétence trouvée dans le CV');
      }

      // Supprimer le fichier temporaire
      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (err) {
        console.error('Error deleting temp file:', err);
      }

      return {
        success: true,
        message: 'CV analysé avec succès',
        data: {
          technicalSkills: technicalSkills.slice(0, 20),
          softSkills: softSkills.slice(0, 20),
          totalSkills: allSkills.length,
          textLength: cleanText.length
        }
      };
    } catch (error) {
      console.error('CV parsing error:', error);
      
      // Supprimer le fichier temporaire en cas d'erreur
      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (err) {}
      
      throw error;
    }
  }
}

module.exports = new CVParserService();