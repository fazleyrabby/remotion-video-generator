const fs = require('fs');
const text = `
TEXT:
Everyone is debating AI coding.

VOICE:
Every week, another debate appears about AI-generated code, vibe coding, and whether developers should rely on AI tools.

--------------------------------------------------

TEXT:
We're asking the wrong question.

VOICE:
But I think we're asking the wrong question.

--------------------------------------------------

TEXT:
The real question is different.

VOICE:
The real question is: What should developers do when clients, management teams, and businesses expect faster delivery because AI exists?

--------------------------------------------------

TEXT:
Software never existed in a vacuum.

VOICE:
Software development has always evolved alongside new tools and new productivity improvements.

--------------------------------------------------

TEXT:
Version control changed expectations.

VOICE:
When version control became mainstream, developers shipped faster.

--------------------------------------------------

TEXT:
Frameworks changed expectations.

VOICE:
When frameworks matured, developers shipped faster.

--------------------------------------------------

TEXT:
Cloud platforms changed expectations.

VOICE:
When cloud infrastructure became easier to manage, developers shipped faster.

--------------------------------------------------

TEXT:
Now AI is doing the same thing.

VOICE:
Today, AI is creating another shift in productivity expectations.

--------------------------------------------------

TEXT:
Businesses see one thing.

VOICE:
Businesses look at these productivity gains and ask a simple question.

--------------------------------------------------

TEXT:
"If it can be done faster..."

VOICE:
If this can be done faster, why are we still working at yesterday's speed?

--------------------------------------------------

TEXT:
That's not an unreasonable question.

VOICE:
From a business perspective, that's not an unreasonable question to ask.

--------------------------------------------------

TEXT:
Companies don't pay for keystrokes.

VOICE:
Companies don't pay developers for typing code.

--------------------------------------------------

TEXT:
They pay for outcomes.

VOICE:
They pay for working software, solved problems, and business results.

--------------------------------------------------

TEXT:
Speed was always valuable.

VOICE:
The market has always rewarded teams that can deliver quality software faster.

--------------------------------------------------

TEXT:
AI changes the tools.

VOICE:
AI simply changes the tools available to achieve that outcome.

--------------------------------------------------

TEXT:
Code was never the hardest part.

VOICE:
One common misconception is that software engineering is primarily about writing code.

--------------------------------------------------

TEXT:
The difficult parts are elsewhere.

VOICE:
The hardest parts usually involve understanding requirements, making tradeoffs, managing complexity, and delivering reliable systems.

--------------------------------------------------

TEXT:
Requirements.

VOICE:
Understanding what actually needs to be built.

--------------------------------------------------

TEXT:
Architecture.

VOICE:
Designing systems that can evolve over time.

--------------------------------------------------

TEXT:
Tradeoffs.

VOICE:
Balancing performance, maintainability, security, and delivery speed.

--------------------------------------------------

TEXT:
Reliability.

VOICE:
Ensuring software continues working under real-world conditions.

--------------------------------------------------

TEXT:
Communication.

VOICE:
Aligning technical decisions with business needs and stakeholder expectations.

--------------------------------------------------

TEXT:
AI can generate code.

VOICE:
AI can generate a controller, migration, API integration, or database query.

--------------------------------------------------

TEXT:
AI cannot own the outcome.

VOICE:
But AI cannot take responsibility for production failures, security issues, or business consequences.

--------------------------------------------------

TEXT:
That responsibility remains human.

VOICE:
That responsibility still belongs to the engineer.

--------------------------------------------------

TEXT:
The skillset is changing.

VOICE:
The industry is slowly shifting from asking: Can you write this code?

--------------------------------------------------

TEXT:
To something bigger.

VOICE:
To asking: Can you deliver reliable software using every tool available?

--------------------------------------------------

TEXT:
Judgment matters more.

VOICE:
Engineering judgment is becoming more valuable, not less.

--------------------------------------------------

TEXT:
Reviewing AI output matters.

VOICE:
The best developers are learning how to evaluate, challenge, and improve AI-generated solutions.

--------------------------------------------------

TEXT:
This is the real distinction.

VOICE:
There is a significant difference between AI-assisted engineering and blind AI dependency.

--------------------------------------------------

TEXT:
AI-Assisted Engineering

VOICE:
Requirements are understood. Architecture is planned. Code is reviewed. Security is validated. Tests are written. Performance is measured.

--------------------------------------------------

TEXT:
Blind Vibe Coding

VOICE:
Copy. Paste. Deploy. Hope for the best.

--------------------------------------------------

TEXT:
One scales productivity.

VOICE:
The first approach increases productivity while maintaining engineering standards.

--------------------------------------------------

TEXT:
The other creates debt.

VOICE:
The second approach creates technical debt and future problems.

--------------------------------------------------

TEXT:
Client expectations have changed.

VOICE:
Whether developers like it or not, clients are becoming increasingly aware of AI capabilities.

--------------------------------------------------

TEXT:
Speed is now part of competition.

VOICE:
Efficiency is becoming part of competitive advantage.

--------------------------------------------------

TEXT:
The standards are moving.

VOICE:
If one team can deliver a high-quality solution in a week, clients naturally question why another team needs a month.

--------------------------------------------------

TEXT:
History repeats itself.

VOICE:
Every major technological shift creates resistance before it becomes normal.

--------------------------------------------------

TEXT:
Adaptation wins.

VOICE:
History consistently rewards professionals who learn how to leverage new tools effectively.

--------------------------------------------------

TEXT:
AI isn't replacing engineering.

VOICE:
AI is not eliminating the need for engineers.

--------------------------------------------------

TEXT:
It's raising the standard.

VOICE:
It is raising the standard for what productive engineering looks like.

--------------------------------------------------

TEXT:
The future belongs to engineers who combine...

VOICE:
Technical expertise. Business understanding. Communication skills. Engineering judgment. And AI-assisted productivity.

--------------------------------------------------

TEXT:
The battle is already over.

VOICE:
The conversation should no longer be about whether developers should use AI.

--------------------------------------------------

TEXT:
The real challenge is responsibility.

VOICE:
The real challenge is learning how to use AI responsibly while maintaining quality, reliability, and accountability.

--------------------------------------------------

TEXT:
The future isn't...

VOICE:
The future isn't manual coding versus AI coding.

--------------------------------------------------

TEXT:
It's about delivery.

VOICE:
It's about who can consistently deliver the best software, in the least amount of time, with the highest level of confidence.

--------------------------------------------------

FINAL FRAME TEXT:
AI Coding Isn't the Problem.

FINAL FRAME VOICE:
Expectations have changed.
`;

const lines = text.split('\n');
const scenes = [];
let currentText = "";
let currentVoice = "";
let mode = "";

for (const line of lines) {
    if (line.startsWith('TEXT:') || line.startsWith('FINAL FRAME TEXT:')) {
        mode = "TEXT";
        continue;
    }
    if (line.startsWith('VOICE:') || line.startsWith('FINAL FRAME VOICE:')) {
        mode = "VOICE";
        continue;
    }
    if (line.startsWith('-----')) {
        if (currentText.trim() || currentVoice.trim()) {
            scenes.push({
                text: currentText.trim(),
                voice: currentVoice.trim(),
                audioFile: `scene_${scenes.length}.mp3`,
                visual: "scene_13.png",
                duration: 120
            });
            currentText = "";
            currentVoice = "";
        }
        mode = "";
        continue;
    }
    
    if (mode === "TEXT" && line.trim()) {
        currentText += line.trim() + "\n";
    }
    if (mode === "VOICE" && line.trim()) {
        currentVoice += line.trim() + " ";
    }
}

// push the last one
if (currentText.trim() || currentVoice.trim()) {
    scenes.push({
        text: currentText.trim(),
        voice: currentVoice.trim(),
        audioFile: `scene_${scenes.length}.mp3`,
        visual: "scene_0.png",
        duration: 120
    });
}

const data = {
  "textRevealStyle": "typewriter",
  "backgroundStyle": "techgrid",
  "backgroundAudio": "ocean-waves",
  "ambientVolume": 25,
  "characterMascot": "none",
  "enableLipSync": false,
  "voiceEngine": "edge",
  "voiceName": "en-US-AndrewNeural",
  "scenes": scenes
};

// Also apply appropriate scene visuals based on my earlier logic
scenes.forEach((scene, i) => {
    // defaults
    scene.visual = "scene_0.png";
    const t = scene.text.toLowerCase();
    const v = scene.voice.toLowerCase();
    
    if (t.includes('version control') || t.includes('frameworks') || t.includes('cloud') || t.includes('ai is doing the same')) {
        scene.visual = "scene_evolution_speed_1780547764912.png";
    }
    if (t.includes('outcomes') || t.includes('keystrokes') || t.includes('companies')) {
        scene.visual = "scene_outcomes_1780547777739.png";
    }
    if (t.includes('architecture') || t.includes('tradeoffs') || t.includes('requirements') || t.includes('communication') || t.includes('reliability')) {
        scene.visual = "scene_13.png";
        if (t.includes('tradeoffs')) scene.visual = "scene_balancing_tradeoffs_1780547800069.png";
    }
    if (t.includes('debt') || t.includes('vibe coding') || t.includes('yesterday') || t.includes('failure')) {
        scene.visual = "scene_10.png";
    }
    if (t.includes('production failures') || t.includes('security issues')) {
        scene.visual = "scene_11.png";
    }
    if (t.includes('future') || t.includes('delivery') || t.includes('judgment') || t.includes('responsibility')) {
        scene.visual = "scene_ai_mastery_1780547812986.png";
    }
});


fs.writeFileSync('ai-coding.json', JSON.stringify(data, null, 2));
console.log("Written ai-coding.json");
