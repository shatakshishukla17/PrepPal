// utils/debug.js
// Import this file into any component where you need enhanced debugging

export const logDataStructure = (data, label = 'Data Structure') => {
    console.group(`🔍 ${label}`);
    try {
      // Check if data is an object/array and has properties
      if (data && typeof data === 'object' && Object.keys(data).length > 0) {
        // Log the structure without the actual values (for large objects)
        const structure = getStructure(data);
        console.log('Structure:', structure);
        
        // Log the full data
        console.log('Full data:', data);
        
        // If it's a small object, also log it as a table
        if (isSimpleObject(data) && Object.keys(data).length <= 10) {
          console.table(data);
        }
      } else {
        console.log('Empty or non-object data:', data);
      }
    } catch (error) {
      console.error('Error logging data structure:', error);
    }
    console.groupEnd();
  };
  
  // Get the structure of an object without the values
  const getStructure = (obj, maxDepth = 3, currentDepth = 0) => {
    if (currentDepth >= maxDepth) return '...';
    
    if (Array.isArray(obj)) {
      if (obj.length === 0) return '[]';
      return `Array(${obj.length})[${typeof obj[0]}${obj.length > 1 ? ', ...' : ''}]`;
    }
    
    if (obj === null) return 'null';
    
    if (typeof obj !== 'object') return typeof obj;
    
    const keys = Object.keys(obj);
    if (keys.length === 0) return '{}';
    
    const structure = {};
    keys.forEach(key => {
      structure[key] = currentDepth < maxDepth - 1 
        ? getStructure(obj[key], maxDepth, currentDepth + 1)
        : typeof obj[key];
    });
    
    return structure;
  };
  
  // Check if the object is simple (no nested objects/arrays)
  const isSimpleObject = (obj) => {
    if (!obj || typeof obj !== 'object') return false;
    
    return Object.values(obj).every(value => 
      value === null || 
      typeof value !== 'object' || 
      (Array.isArray(value) && value.length === 0) ||
      (typeof value === 'object' && Object.keys(value).length === 0)
    );
  };
  
  // Log and track API calls
  export const apiLogger = {
    async call(apiFunc, label = 'API Call') {
      console.time(`⏱️ ${label} Duration`);
      console.log(`🚀 Starting ${label}...`);
      
      try {
        const result = await apiFunc();
        console.log(`✅ ${label} Completed Successfully`);
        return result;
      } catch (error) {
        console.error(`❌ ${label} Failed:`, error);
        throw error;
      } finally {
        console.timeEnd(`⏱️ ${label} Duration`);
      }
    }
  };
  
  // Function to safely parse JSON with fallback
  export const safeJsonParse = (jsonString, fallback = null) => {
    try {
      if (!jsonString) return fallback;
      return JSON.parse(jsonString);
    } catch (error) {
      console.error('Error parsing JSON:', error);
      console.log('Invalid JSON string:', jsonString);
      return fallback;
    }
  };
  
  // Function to detect and fix common JSON parsing errors
  export const repairJsonString = (str) => {
    if (!str) return str;
    
    // Try to fix common JSON string issues
    let fixed = str;
    
    // Remove trailing commas inside objects/arrays
    fixed = fixed.replace(/,\s*([\]}])/g, '$1');
    
    // Ensure property names are double-quoted
    fixed = fixed.replace(/([{,]\s*)([a-zA-Z0-9_$]+)\s*:/g, '$1"$2":');
    
    // Replace single quotes with double quotes (outside of already double-quoted strings)
    // This is complex to do correctly, so this is just a simple approximation
    fixed = fixed.replace(/'([^']*?)'/g, '"$1"');
    
    return fixed;
  };