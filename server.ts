import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize GoogleGenAI server-side client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

interface SubjectDetail {
  name: string;
  code: string;
  conducted: number;
  attended: number;
  percentage: number;
  remainingClasses: number;
  neededFor75: number | string;
  neededFor90: number | string;
  status: string;
}

interface StudentAdvisorPayload {
  message: string;
  history?: { role: 'user' | 'model'; parts: { text: string }[] }[];
  student: {
    name: string;
    email: string;
    sectionName: string;
    rollNumber?: string;
  };
  subjects: SubjectDetail[];
  overall: {
    totalConducted: number;
    totalAttended: number;
    overallPercentage: number;
    totalRemaining: number;
    above90Count: number;
    between75And90Count: number;
    below75Count: number;
  };
  odContext?: {
    approvedOdClasses?: number;
    leaveType?: string;
  };
}

// Fallback intelligent responder when API key is missing or offline
function generateLocalAdvisorResponse(payload: StudentAdvisorPayload): string {
  const { student, subjects, overall, message } = payload;
  const lowerMsg = message.toLowerCase();

  const atRiskSubjects = subjects.filter((s) => s.percentage < 75 && s.conducted > 0);
  const safeSubjects = subjects.filter((s) => s.percentage >= 75);
  const honorSubjects = subjects.filter((s) => s.percentage >= 90);

  // If question is about taking leave / bunking
  if (lowerMsg.includes('leave') || lowerMsg.includes('bunk') || lowerMsg.includes('skip') || lowerMsg.includes('tomorrow')) {
    if (atRiskSubjects.length > 0) {
      const riskNames = atRiskSubjects.map((s) => `${s.name} (${s.percentage}%)`).join(', ');
      return `⚠️ **Leave Caution for ${student.name}**\n\nI strongly advise **against taking leave** right now. You currently have **${atRiskSubjects.length} subject(s) below the 75% threshold**: ${riskNames}.\n\nMissing even 1 additional class will worsen your deficit:\n- In ${atRiskSubjects[0].name}, you need **${atRiskSubjects[0].neededFor75} more classes** just to reach 75%.\n- Total remaining semester classes: **${overall.totalRemaining}**.\n\n👉 **Recommended Action**: Attend all classes for at least the next 2 weeks to build a safety cushion.`;
    } else {
      return `✅ **Leave Feasibility Analysis**\n\nYour overall attendance is **${overall.overallPercentage}%** across ${subjects.length} subjects with no active detention risks! However, before taking leave:\n\n1. Check which subjects meet on that day.\n2. Ensure your subject percentages stay above **75%** even if you miss those periods.\n3. Keep the **90% distinction cushion** in mind if you are aiming for internal honors.`;
    }
  }

  // If question is about OD (On-Duty) or Medical Leave
  if (lowerMsg.includes('od') || lowerMsg.includes('on duty') || lowerMsg.includes('medical') || lowerMsg.includes('condonation')) {
    return `🏥 **OD & Medical Condonation Guidance (SRM IST Regulations)**\n\n- **On-Duty (OD)**: Official OD is awarded for approved academic activities (Symposia, Hackathons, Sports, NSS/NCC). When OD is approved, those hours are treated as attended, raising your attendance without penalty.\n- **Medical Condonation**: Under SRM IST rules, students with **65% to 74.9%** attendance due to certified hospitalization/medical illness may apply for condonation through the HoD and Dean.\n- **Irreversible Rule**: Below **65%**, medical condonation cannot ordinarily be granted.\n\nUse our **OD / Medical Leave Simulator** tab to test how many OD credits you need to flip risky subjects into safe territory!`;
  }

  // If question is about 90% or targets
  if (lowerMsg.includes('90') || lowerMsg.includes('target') || lowerMsg.includes('honors')) {
    const needWork = subjects.filter((s) => s.percentage < 90);
    return `🎯 **Roadmap to 90% Attendance for ${student.name}**\n\n- Current subjects at ≥90%: **${honorSubjects.length} of ${subjects.length}**.\n- To reach 90% overall, you have attended **${overall.totalAttended}** of **${overall.totalConducted}** classes (${overall.overallPercentage}%).\n\n**Subject Breakdown**:\n${needWork.map((s) => `• **${s.name}**: Current ${s.percentage}%. Needs **${s.neededFor90}** consecutive classes attended.`).join('\n')}\n\nMaintain 100% attendance in your upcoming sessions to rapidly pull up your numbers!`;
  }

  // General attendance status summary
  return `📊 **Academic Attendance Assessment for ${student.name} (${student.sectionName})**\n\n- **Overall Attendance**: **${overall.overallPercentage}%** (${overall.totalAttended} attended / ${overall.totalConducted} conducted)\n- **Remaining Classes**: **${overall.totalRemaining} scheduled** until Nov 29, 2026\n- **Status**: ${atRiskSubjects.length > 0 ? `🚨 **${atRiskSubjects.length} subject(s) in Detention Danger Zone (<75%)**` : `✅ **All subjects are currently safe (≥75%)**`}\n\n${atRiskSubjects.length > 0 ? `### Immediate Action Required:\n${atRiskSubjects.map((s) => `• **${s.name}** (${s.code}): ${s.percentage}% — Must attend at least **${s.neededFor75}** remaining classes to clear detention.`).join('\n')}\n\n` : ''}Feel free to ask me:\n1. *"Can I take leave tomorrow?"*\n2. *"How many OD hours do I need to reach 75%?"*\n3. *"What is the condonation limit at SRM?"*`;
}

// Server proxy endpoint for AI Attendance Advisor
app.post('/api/gemini/advisor', async (req: Request, res: Response) => {
  try {
    const payload = req.body as StudentAdvisorPayload;
    if (!payload || !payload.message) {
      return res.status(400).json({ error: 'Message payload is required.' });
    }

    const { message, student, subjects = [], overall, history = [] } = payload;

    // Check if GEMINI_API_KEY is available
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey.trim() === '' || apiKey === 'MY_GEMINI_API_KEY') {
      const fallbackReply = generateLocalAdvisorResponse(payload);
      return res.json({
        reply: fallbackReply,
        source: 'local_intelligence_engine',
      });
    }

    // Prepare system instructions with rigorous academic rules and student context
    const systemPrompt = `You are "Attendance Advisor", an AI academic advisor for SRM Institute of Science and Technology (Tiruchirappalli Campus).
Your role is to help students mathematically understand their attendance, avoid end-semester detention (<75%), reach the 90% honor goal, evaluate OD (On-Duty) and Medical Leaves, and plan their semester schedule.

### University Regulations:
1. Minimum Exam Eligibility: 75% attendance in each subject. Students with <75% are DETAINED and barred from end-semester exams.
2. Medical Condonation: Students between 65% and 74.9% may apply for medical condonation with valid hospital/medical documentation. Below 65%, condonation is strictly not allowed.
3. 90% Target: SRM internal assessment honors threshold and safe buffer.
4. Semester Dates: 29 August 2026 to 29 November 2026.
5. On-Duty (OD): Awarded for authorized academic events (hackathons, sports, symposium). OD classes convert missed classes into attended classes.

### Current Student Context:
- Name: ${student.name || 'Student'}
- Email: ${student.email || 'N/A'}
- Section: ${student.sectionName || 'N/A'}
- Roll Number: ${student.rollNumber || 'Not specified'}
- Overall Attendance: ${overall?.overallPercentage ?? 0}% (${overall?.totalAttended ?? 0}/${overall?.totalConducted ?? 0} classes)
- Remaining Scheduled Classes: ${overall?.totalRemaining ?? 0}
- Subjects below 75%: ${overall?.below75Count ?? 0}
- Subjects 75%-90%: ${overall?.between75And90Count ?? 0}
- Subjects >=90%: ${overall?.above90Count ?? 0}

### Subject-by-Subject Attendance Table:
${subjects
  .map(
    (s) =>
      `- ${s.name} (${s.code}): ${s.percentage}% [${s.attended}/${s.conducted} classes]. Remaining in semester: ${s.remainingClasses}. Needed for 75%: ${s.neededFor75}. Needed for 90%: ${s.neededFor90}. Status: ${s.status}.`
  )
  .join('\n')}

### Response Guidelines:
- Give mathematically precise, encouraging, and actionable guidance.
- If asked about skipping class or taking leave, calculate the exact mathematical risk and warn them if their attendance will drop below 75%.
- Use clean Markdown with bullet points, bold numbers, and clear headings.
- Keep responses concise (under 250 words) unless detailed analysis is requested.`;

    // Format chat contents
    const contents: Array<{ role: 'user' | 'model'; parts: { text: string }[] }> = [];

    // Add recent history if available (limit to last 6 messages)
    if (Array.isArray(history) && history.length > 0) {
      const recent = history.slice(-6);
      for (const item of recent) {
        contents.push({
          role: item.role === 'model' ? 'model' : 'user',
          parts: [{ text: item.parts?.[0]?.text || '' }],
        });
      }
    }

    // Add current user prompt
    contents.push({
      role: 'user',
      parts: [{ text: message }],
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: contents,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
      },
    });

    const replyText = response.text || generateLocalAdvisorResponse(payload);
    return res.json({
      reply: replyText,
      source: 'gemini-3.8-flash',
    });
  } catch (error: any) {
    console.error('Error in /api/gemini/advisor:', error);
    // Graceful fallback to local intelligence engine so user never sees a broken chat
    const fallbackReply = generateLocalAdvisorResponse(req.body);
    return res.json({
      reply: fallbackReply,
      source: 'local_fallback',
    });
  }
});

// Configure Vite middleware in development or static hosting in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`\n  ⚡ Attendance Predictor is running!`);
    console.log(`  ➜  Local:   http://localhost:${PORT}/`);
    console.log(`  ➜  Open in browser: http://localhost:${PORT}/\n`);
  });
}

startServer();
