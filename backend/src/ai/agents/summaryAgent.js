const { callGroq } = require("../crew");
const prompts = require("../prompts");

async function generateSummaries(content) {
  const [executive, technical, beginner] = await Promise.all([
    callGroq(prompts.executivePrompt(content)),
    callGroq(prompts.technicalPrompt(content)),
    callGroq(prompts.beginnerPrompt(content)),
  ]);

  return { executive, technical, beginner };
}

module.exports = generateSummaries;
