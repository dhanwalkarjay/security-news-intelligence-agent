const { callGroq } = require("../crew");
const prompts = require("../prompts");

async function recommendJobs(content, skills) {
  try {
    const response = await callGroq(prompts.jobPrompt(content, skills));
    
    // Response should be in format:
    // Recommended Roles:
    // 1. Role - description
    // 2. Role - description
    // 3. Role - description
    
    // Return formatted response as-is; formatting happens in frontend
    return response || "No job recommendations available.";
  } catch (error) {
    console.error("Job recommendation error:", error.message);
    return "Job recommendation failed. Please try again.";
  }
}

module.exports = recommendJobs;
