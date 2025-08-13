/**
 * LinkedIn Profile Import and Data Processing
 * Handles importing and parsing LinkedIn profile data for user profiles
 */

export interface LinkedInProfileData {
  fullName: string;
  title: string;
  location: string;
  bio: string;
  languages: Array<{
    name: string;
    proficiency: 'Native' | 'Bilingual' | 'Full Professional' | 'Professional Working' | 'Limited Working' | 'Elementary';
  }>;
  skills: string[];
  education: Array<{
    school: string;
    years: string;
    degree?: string;
    field?: string;
  }>;
  experience: Array<{
    company: string;
    position: string;
    duration: string;
    description?: string;
  }>;
  certifications: string[];
}

export interface UserProfileMapping {
  display_name: string;
  bio: string;
  location: string;
  linkedin_data: LinkedInProfileData;
  professional_title: string;
  credentials: string[];
  skills: string[];
  languages: string[];
  education_history: any[];
}

// Aaron Tong's real LinkedIn profile data
export const aaronTongLinkedInData: LinkedInProfileData = {
  fullName: "Aaron Tong",
  title: "P.Eng, PMP at Aeternum",
  location: "Alberta, Canada",
  bio: "My goal in life is to challenge stagnation. I constantly strive to gain new experiences and knowledge to help me become a better person, professional, and leader. I believe that we can always improve and that there is always more to learn.",
  languages: [
    { name: "English", proficiency: "Full Professional" },
    { name: "Cantonese", proficiency: "Limited Working" }
  ],
  skills: [
    "Project Management",
    "Heavy Lift Engineering", 
    "Construction Management",
    "Engineering Leadership",
    "Oil & Gas Operations",
    "Industrial Engineering",
    "Risk Management",
    "Team Leadership",
    "Process Optimization",
    "Safety Management"
  ],
  education: [
    {
      school: "University of Alberta",
      years: "2007-2011",
      degree: "Bachelor of Engineering",
      field: "Engineering"
    }
  ],
  experience: [
    {
      company: "Aeternum",
      position: "P.Eng, PMP",
      duration: "Current",
      description: "Leading engineering projects and program management initiatives"
    }
  ],
  certifications: ["P.Eng", "PMP"]
};

/**
 * Parse LinkedIn profile data and map to user profile format
 */
export function parseLinkedInProfile(linkedInData: LinkedInProfileData): UserProfileMapping {
  // Extract credentials from title
  const credentials = extractCredentials(linkedInData.title);
  
  // Extract company from title
  const professionalTitle = extractProfessionalTitle(linkedInData.title);
  
  return {
    display_name: linkedInData.fullName,
    bio: linkedInData.bio,
    location: linkedInData.location,
    linkedin_data: linkedInData,
    professional_title: professionalTitle,
    credentials,
    skills: linkedInData.skills,
    languages: linkedInData.languages.map(lang => `${lang.name} (${lang.proficiency})`),
    education_history: linkedInData.education
  };
}

/**
 * Extract professional credentials from title string
 */
function extractCredentials(title: string): string[] {
  const credentialPatterns = [
    /P\.Eng/gi,
    /PMP/gi,
    /PE/gi,
    /PhD/gi,
    /MD/gi,
    /JD/gi,
    /CPA/gi,
    /MBA/gi,
    /MSc/gi,
    /BSc/gi
  ];
  
  const credentials: string[] = [];
  
  credentialPatterns.forEach(pattern => {
    const matches = title.match(pattern);
    if (matches) {
      matches.forEach(match => {
        if (!credentials.includes(match)) {
          credentials.push(match);
        }
      });
    }
  });
  
  return credentials;
}

/**
 * Extract professional title from LinkedIn title string
 */
function extractProfessionalTitle(title: string): string {
  // Remove credentials and company info
  let cleanTitle = title;
  
  // Remove credentials
  const credentialPatterns = [/P\.Eng/gi, /PMP/gi, /PE/gi, /PhD/gi, /MD/gi, /JD/gi, /CPA/gi];
  credentialPatterns.forEach(pattern => {
    cleanTitle = cleanTitle.replace(pattern, '');
  });
  
  // Remove " at Company" pattern
  cleanTitle = cleanTitle.replace(/\s+at\s+.+$/i, '');
  
  // Clean up extra spaces and commas
  cleanTitle = cleanTitle.replace(/\s*,\s*/g, ', ').trim();
  cleanTitle = cleanTitle.replace(/^,\s*|,\s*$/g, '');
  
  return cleanTitle || "Professional";
}

/**
 * Validate LinkedIn profile data structure
 */
export function validateLinkedInData(data: any): data is LinkedInProfileData {
  return (
    data &&
    typeof data.fullName === 'string' &&
    typeof data.title === 'string' &&
    typeof data.location === 'string' &&
    typeof data.bio === 'string' &&
    Array.isArray(data.languages) &&
    Array.isArray(data.skills) &&
    Array.isArray(data.education)
  );
}

/**
 * Create taste profile preferences based on professional background
 */
export function generateTasteProfileFromLinkedIn(linkedInData: LinkedInProfileData): {
  culinary_adventurousness: number;
  preference_notes: string[];
  dietary_considerations: string[];
} {
  const preferences = {
    culinary_adventurousness: 3.5, // Default moderate
    preference_notes: [] as string[],
    dietary_considerations: [] as string[]
  };
  
  // Infer preferences from location
  if (linkedInData.location.includes('Alberta') || linkedInData.location.includes('Canada')) {
    preferences.preference_notes.push('Canadian comfort food familiarity');
    preferences.culinary_adventurousness = 3.8; // Canadians tend to be open to diverse cuisines
  }
  
  // Infer from languages
  const hasCantonese = linkedInData.languages.some(lang => 
    lang.name.toLowerCase().includes('cantonese')
  );
  
  if (hasCantonese) {
    preferences.preference_notes.push('Familiarity with Cantonese/Chinese cuisine');
    preferences.culinary_adventurousness += 0.5;
  }
  
  // Professional background considerations
  if (linkedInData.title.includes('Engineering') || linkedInData.skills.some(skill => 
    skill.toLowerCase().includes('engineering')
  )) {
    preferences.preference_notes.push('Detail-oriented approach to food experiences');
  }
  
  if (linkedInData.title.includes('PMP') || linkedInData.skills.some(skill => 
    skill.toLowerCase().includes('project management')
  )) {
    preferences.preference_notes.push('Structured approach to trying new cuisines');
  }
  
  // Cap adventurousness at 5
  preferences.culinary_adventurousness = Math.min(preferences.culinary_adventurousness, 5);
  
  return preferences;
}

/**
 * Format professional credentials for display
 */
export function formatCredentials(credentials: string[]): string {
  if (credentials.length === 0) return '';
  if (credentials.length === 1) return credentials[0];
  if (credentials.length === 2) return credentials.join(', ');
  
  return credentials.slice(0, -1).join(', ') + ', and ' + credentials[credentials.length - 1];
}

/**
 * Get professional context for food recommendations
 */
export function getProfessionalFoodContext(linkedInData: LinkedInProfileData): {
  work_lunch_preferences: string[];
  business_dining_considerations: string[];
  networking_venues: string[];
} {
  const context = {
    work_lunch_preferences: [] as string[],
    business_dining_considerations: [] as string[],
    networking_venues: [] as string[]
  };
  
  // Engineering/Construction background
  if (linkedInData.skills.some(skill => 
    skill.toLowerCase().includes('engineering') || 
    skill.toLowerCase().includes('construction')
  )) {
    context.work_lunch_preferences.push('Hearty, substantial meals');
    context.work_lunch_preferences.push('Quick service options for busy schedules');
    context.business_dining_considerations.push('Professional atmosphere suitable for technical discussions');
  }
  
  // Project Management background
  if (linkedInData.skills.some(skill => 
    skill.toLowerCase().includes('project management')
  )) {
    context.business_dining_considerations.push('Meeting-friendly restaurants with good acoustics');
    context.networking_venues.push('Upscale casual dining for client meetings');
  }
  
  // Alberta/Canada location
  if (linkedInData.location.includes('Alberta') || linkedInData.location.includes('Canada')) {
    context.networking_venues.push('Canadian cuisine establishments');
    context.work_lunch_preferences.push('Cold weather comfort foods');
  }
  
  return context;
}