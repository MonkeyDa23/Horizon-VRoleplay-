import type { Product, Quiz, QuizSubmission, SubmissionStatus, User, AuditLogEntry } from '../types';
import { CONFIG } from './config';
import { translations } from './translations';

// This file contains the mock database and data manipulation functions.
// It is intended to be used by the mock API layer (`/lib/api.ts`).
// In a real application, this would all be replaced by a real database and backend logic.

// --- AUDIT LOG ---
let auditLogs: AuditLogEntry[] = [];
const addAuditLog = (admin: User, action: string) => {
    const newLog: AuditLogEntry = {
        id: `log_${Date.now()}`,
        adminId: admin.id,
        adminUsername: admin.username,
        timestamp: new Date().toISOString(),
        action,
    };
    auditLogs.push(newLog);
    console.log(`[AUDIT LOG] User: ${admin.username}, Action: ${action}`);
};
const getAuditLogs = (): AuditLogEntry[] => {
    return JSON.parse(JSON.stringify(auditLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())));
};


// Mock data for the store
let products: Product[] = [
  {
    id: 'prod_001',
    nameKey: 'product_vip_bronze_name',
    descriptionKey: 'product_vip_bronze_desc',
    price: 9.99,
    imageUrl: 'https://images.unsplash.com/photo-1572095764893-06a7a3c30d70?q=80&w=400&h=300&fit=crop&crop=entropy'
  },
  {
    id: 'prod_002',
    nameKey: 'product_vip_silver_name',
    descriptionKey: 'product_vip_silver_desc',
    price: 19.99,
    imageUrl: 'https://images.unsplash.com/photo-1593433600958-f82333934057?q=80&w=400&h=300&fit=crop&crop=entropy'
  },
  {
    id: 'prod_003',
    nameKey: 'product_cash_1_name',
    descriptionKey: 'product_cash_1_desc',
    price: 4.99,
    imageUrl: 'https://images.unsplash.com/photo-1579621970795-87f55d90727f?q=80&w=400&h=300&fit=crop&crop=entropy'
  },
  {
    id: 'prod_004',
    nameKey: 'product_custom_plate_name',
    descriptionKey: 'product_custom_plate_desc',
    price: 14.99,
    imageUrl: 'https://images.unsplash.com/photo-1616788494459-01bce4a4b86a?q=80&w=400&h=300&fit=crop&crop=entropy'
  },
];

// Mock data for quizzes/applications
let quizzes: Quiz[] = [
  {
    id: 'quiz_police_dept',
    titleKey: 'quiz_police_name',
    descriptionKey: 'quiz_police_desc',
    isOpen: true,
    questions: [
      { id: 'q1', textKey: 'q_police_1', timeLimit: 60 },
      { id: 'q2', textKey: 'q_police_2', timeLimit: 90 },
    ],
  },
  {
    id: 'quiz_ems_dept',
    titleKey: 'quiz_medic_name',
    descriptionKey: 'quiz_medic_desc',
    isOpen: false,
    questions: [
      { id: 'q1', textKey: 'q_medic_1', timeLimit: 75 },
    ],
  },
];

// Mock database for submissions
let submissions: QuizSubmission[] = [];

// --- QUIZ API ---
const getQuizzes = (): Quiz[] => JSON.parse(JSON.stringify(quizzes));
const getQuizById = (id: string): Quiz | undefined => JSON.parse(JSON.stringify(quizzes.find(q => q.id === id)));
const saveQuiz = (quizToSave: Quiz, admin: User): void => {
    const index = quizzes.findIndex(q => q.id === quizToSave.id);
    const quizName = translations[quizToSave.titleKey]?.en || quizToSave.titleKey;

    if (index !== -1) {
        addAuditLog(admin, `Updated quiz '${quizName}'`);
        quizzes[index] = quizToSave;
    } else {
        addAuditLog(admin, `Created quiz '${quizName}'`);
        quizzes.push(quizToSave);
    }
}
const deleteQuiz = (quizId: string, admin: User): void => {
    const quizToDelete = quizzes.find(q => q.id === quizId);
    if (quizToDelete) {
        const quizName = translations[quizToDelete.titleKey]?.en || quizToDelete.titleKey;
        addAuditLog(admin, `Deleted quiz '${quizName}'`);
        quizzes = quizzes.filter(q => q.id !== quizId);
    }
}

// --- SUBMISSION API ---
const getSubmissions = (): QuizSubmission[] => {
  return JSON.parse(JSON.stringify(submissions.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())));
}

const getSubmissionsByUserId = (userId: string): QuizSubmission[] => {
  return getSubmissions().filter(sub => sub.userId === userId);
}

const addSubmission = (submission: Omit<QuizSubmission, 'id' | 'status'>): void => {
    const newSubmission: QuizSubmission = {
      ...submission,
      id: `sub_${Date.now()}`,
      status: 'pending',
    }
    submissions.push(newSubmission);
    
    const discordNotificationPayload = {
      channelId: CONFIG.APPLICATION_NOTIFICATION_CHANNEL_ID,
      content: `<@&${CONFIG.ADMIN_ROLE_IDS[0]}>`,
      embeds: [{
        title: `New Application Submitted: ${newSubmission.quizTitle}`,
        color: 0x00F2EA,
        author: { name: newSubmission.username },
        fields: newSubmission.answers.map((ans, index) => ({
          name: `Question #${index + 1}: ${ans.questionText}`,
          value: `\`\`\`${ans.answer || 'No answer provided.'}\`\`\``,
        })),
        footer: { text: `Applicant ID: ${newSubmission.userId} | Submission ID: ${newSubmission.id}` },
        timestamp: new Date().toISOString(),
      }]
    };
    
    console.groupCollapsed(`[BACKEND SIM] New Application Submitted: ${newSubmission.quizTitle}`);
    console.log(`A real backend server would now send a message to your Discord server.`);
    console.log(discordNotificationPayload);
    console.groupEnd();
}

const updateSubmissionStatus = (submissionId: string, status: SubmissionStatus, admin: User): void => {
  const index = submissions.findIndex(sub => sub.id === submissionId);
  if (index !== -1) {
    const submission = submissions[index];
    submission.status = status;
    submission.adminId = admin.id;
    submission.adminUsername = admin.username;

    addAuditLog(admin, `Updated status of ${submission.username}'s application for '${submission.quizTitle}' to ${status.toUpperCase()}`);
    
    if (status === 'accepted' || status === 'refused') {
      const decisionColor = status === 'accepted' ? 0x22C55E : 0xEF4444;
      const dmPayload = {
        recipient_id: submission.userId,
        embeds: [{
            title: `Your Application Status has been Updated`,
            color: decisionColor,
            description: `Hello ${submission.username}, your application for **${submission.quizTitle}** has been **${status.toUpperCase()}**.`,
            footer: { text: `Action by: ${admin?.username}` },
            timestamp: new Date().toISOString(),
        }]
      };

      console.groupCollapsed(`[BACKEND SIM] User Application Status Updated to ${status.toUpperCase()}`);
      console.log('A real backend server would now send a Direct Message to the applicant.');
      console.log(dmPayload);
      console.groupEnd();
    }
  }
}

// --- MTA SERVER API ---
interface MtaServerStatus {
    name: string;
    players: number;
    maxPlayers: number;
}

const getMtaServerStatus = async (): Promise<MtaServerStatus> => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    if (Math.random() < 0.1) {
        return Promise.reject(new Error("Server is offline"));
    }
    const players = 80 + Math.floor(Math.random() * 40);
    const maxPlayers = 200;
    return { name: 'Horizon Roleplay | Your Story Begins', players, maxPlayers };
}


export { products, getQuizzes, getQuizById, saveQuiz, deleteQuiz, getSubmissions, getSubmissionsByUserId, addSubmission, updateSubmissionStatus, getMtaServerStatus, getAuditLogs };
