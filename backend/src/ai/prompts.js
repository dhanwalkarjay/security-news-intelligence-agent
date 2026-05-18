const baseRules = `Rules:
- Keep the answer crisp and directly useful.
- Use plain text with short headings and bullets.
- No long paragraphs.
- Do not invent CVEs, IOCs, threat actors, numbers, or product names.
- If the article does not include a detail, say "Not stated".`;

module.exports = {
  executivePrompt: (content) =>
    `Create an executive-level cybersecurity brief.

${baseRules}

Length limit: maximum 5 bullets total, 12 words per bullet.
Audience: leaders who need risk and action, not technical depth.

Format exactly:
Impact:
- ...
Risk:
- ...
Action:
- ...

Article:
${content}`,

  technicalPrompt: (content) =>
    `Create a technical cybersecurity analysis for engineers.

${baseRules}

Length limit: maximum 7 bullets total, 14 words per bullet.
Audience: SOC, security engineers, incident responders.
Focus only on engineering-useful facts.

Format exactly:
Technical Findings:
- ...
Detection:
- ...
Mitigation:
- ...

Article:
${content}`,

  beginnerPrompt: (content) =>
    `Explain this cybersecurity news to a complete beginner.

${baseRules}

Length limit: maximum 5 bullets total, 13 words per bullet.
Audience: no cybersecurity background.
Use simple words. Avoid jargon unless briefly explained.

Format exactly:
Simple Meaning:
- ...
Who It Affects:
- ...
What To Do:
- ...

Article:
${content}`,

  jobPrompt: (content, skills) =>
    `Suggest cybersecurity jobs based on the article and user skills.

${baseRules}

User skills: ${skills || "Not provided"}
Length limit: exactly 3 roles.
Each role must be one line only.
Show only the job title and one short description.
Do not include "Why", "Improve", skills to learn, or level labels.

Format exactly:
Recommended Roles:
1. Job Title - one short description.
2. Job Title - one short description.
3. Job Title - one short description.

Article:
${content}`,
};
