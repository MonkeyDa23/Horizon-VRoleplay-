import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useLocalization } from '../hooks/useLocalization';
import { getSubmissionsByUserId } from '../lib/api';
import type { QuizSubmission, SubmissionStatus } from '../types';
import { useNavigate } from 'react-router-dom';
import { User, Loader2, FileText } from 'lucide-react';

const ProfilePage: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const { t } = useLocalization();
  const navigate = useNavigate();
  
  const [submissions, setSubmissions] = useState<QuizSubmission[]>([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/');
      return;
    }

    if (user) {
      const fetchSubmissions = async () => {
        setSubmissionsLoading(true);
        try {
          const userSubmissions = await getSubmissionsByUserId(user.id);
          setSubmissions(userSubmissions);
        } catch (error) {
          console.error("Failed to fetch user submissions for profile", error);
        } finally {
          setSubmissionsLoading(false);
        }
      };
      fetchSubmissions();
    }
  }, [user, authLoading, navigate]);

  const renderStatusBadge = (status: SubmissionStatus) => {
    const statusMap = {
      pending: { text: t('status_pending'), color: 'bg-yellow-500/20 text-yellow-400' },
      taken: { text: t('status_taken'), color: 'bg-blue-500/20 text-blue-400' },
      accepted: { text: t('status_accepted'), color: 'bg-green-500/20 text-green-400' },
      refused: { text: t('status_refused'), color: 'bg-red-500/20 text-red-400' },
    };
    const { text, color } = statusMap[status];
    return <span className={`px-3 py-1 text-sm font-bold rounded-full ${color}`}>{text}</span>;
  };
  
  if (authLoading || !user) {
    return (
      <div className="container mx-auto px-6 py-16 flex justify-center items-center h-96">
        <Loader2 size={48} className="text-brand-cyan animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-16">
      <div className="text-center mb-12">
        <div className="inline-block p-4 bg-brand-light-blue rounded-full mb-4">
          <User className="text-brand-cyan" size={48} />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">{t('my_profile')}</h1>
      </div>
      
      <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
            <div className="bg-brand-dark-blue p-6 rounded-lg border border-brand-light-blue/50 text-center shadow-lg">
                <img 
                    src={user.avatar} 
                    alt={user.username}
                    className="w-32 h-32 rounded-full mx-auto border-4 border-brand-cyan shadow-glow-cyan-light"
                />
                <h2 className="text-3xl font-bold mt-4">{user.username}</h2>
                {user.primaryRole && (
                    <p className="font-bold mt-1" style={{color: user.primaryRole.color}}>{user.primaryRole.name}</p>
                )}
                <div className="mt-6 space-y-3 text-gray-300 text-sm">
                    <div className="flex flex-col items-center">
                        <span className="font-semibold text-gray-400">{t('user_id')}</span>
                        <code className="text-xs bg-brand-dark px-2 py-1 rounded mt-1">{user.id}</code>
                    </div>
                     <div className="flex flex-col items-center">
                        <span className="font-semibold text-gray-400">{t('role')}</span>
                        <span className={`px-3 py-1 text-sm font-bold rounded-full mt-1 ${user.isAdmin ? 'bg-brand-cyan/20 text-brand-cyan' : 'bg-gray-500/20 text-gray-300'}`}>
                          {user.isAdmin ? t('admin') : t('member')}
                        </span>
                    </div>
                </div>
            </div>
        </div>

        <div className="lg:col-span-2">
           <h3 className="text-2xl font-bold mb-4 flex items-center gap-3">
             <FileText className="text-brand-cyan" />
             {t('recent_applications')}
           </h3>
           <div className="bg-brand-dark-blue rounded-lg border border-brand-light-blue/50">
                <div className="overflow-x-auto">
                {submissionsLoading ? (
                    <div className="flex justify-center items-center h-48">
                        <Loader2 size={40} className="text-brand-cyan animate-spin" />
                    </div>
                ) : (
                    <table className="w-full text-left min-w-[500px]">
                    <thead className="border-b border-brand-light-blue/50 text-gray-300">
                        <tr>
                        <th className="p-4">{t('application_type')}</th>
                        <th className="p-4">{t('submitted_on')}</th>
                        <th className="p-4">{t('status')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {submissions.length === 0 ? (
                        <tr>
                            <td colSpan={3} className="p-8 text-center text-gray-400">
                            {t('no_applications_submitted')}
                            </td>
                        </tr>
                        ) : submissions.map((sub, index) => (
                        <tr key={sub.id} className={`border-b border-brand-light-blue/50 ${index === submissions.length - 1 ? 'border-none' : ''}`}>
                            <td className="p-4 font-semibold">{sub.quizTitle}</td>
                            <td className="p-4 text-sm text-gray-400">{new Date(sub.submittedAt).toLocaleDateString()}</td>
                            <td className="p-4">{renderStatusBadge(sub.status)}</td>
                        </tr>
                        ))}
                    </tbody>
                    </table>
                )}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
