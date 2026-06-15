import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const SECTIONS = [
  {
    id: 1,
    title: "1. Overall Experience",
    questions: [
      { id: "s1_q1", type: "rating", text: "How satisfied are you with your overall experience at the company?" },
      { id: "s1_q2", type: "rating", text: "How likely are you to recommend this company as a great place to work?" },
      { id: "s1_q3", type: "rating", text: "Do you feel your work aligns with the company's goals and vision?" },
      { id: "s1_q4", type: "rating", text: "How would you rate the clarity of your role and responsibilities?" },
      { id: "s1_q5", type: "rating", text: "How satisfied are you with the work-life balance at the company?" }
    ]
  },
  {
    id: 2,
    title: "2. Leadership Evaluation",
    questions: [
      { id: "s2_q1", type: "rating", text: "Trust in the company's executive leadership team." },
      { id: "s2_q2", type: "rating", text: "Clarity and effectiveness of communication from leadership." },
      { id: "s2_q3", type: "rating", text: "Confidence in the strategic direction and vision set by leaders." },
      { id: "s2_q4", type: "rating", text: "Leadership's empathy and care towards employees." },
      { id: "s2_q5", type: "rating", text: "Effectiveness of decision-making by the leadership team." },
      { id: "s2_open1", type: "text", text: "What is one thing the leadership team does exceptionally well?" },
      { id: "s2_open2", type: "text", text: "What is one area where the leadership team needs improvement?" }
    ]
  },
  {
    id: 3,
    title: "3. Reporting Manager",
    questions: [
      { id: "s3_q1", type: "rating", text: "My manager provides clear guidance and direction." },
      { id: "s3_q2", type: "rating", text: "My manager is supportive of my professional growth." },
      { id: "s3_q3", type: "rating", text: "My manager provides regular and constructive feedback." },
      { id: "s3_q4", type: "rating", text: "My manager treats all team members with fairness and respect." },
      { id: "s3_q5", type: "rating", text: "My manager is accessible and approachable when needed." },
      { id: "s3_q6", type: "rating", text: "My manager listens to my suggestions and concerns." },
      { id: "s3_q7", type: "rating", text: "My manager helps me resolve work-related challenges." },
      { id: "s3_open", type: "text", text: "Any specific comments or suggestions about your reporting manager?" }
    ]
  },
  {
    id: 4,
    title: "4. HR Evaluation",
    questions: [
      { id: "s4_q1", type: "rating", text: "HR is responsive to queries and requests." },
      { id: "s4_q2", type: "rating", text: "HR onboarding process was smooth and helpful." },
      { id: "s4_q3", type: "rating", text: "HR handles grievances and issues fairly." },
      { id: "s4_q4", type: "rating", text: "Company policies are clearly communicated by HR." },
      { id: "s4_q5", type: "rating", text: "HR's management of benefits and employee welfare." },
      { id: "s4_q6", type: "rating", text: "HR's efforts to keep employees engaged and motivated." },
      { id: "s4_open", type: "text", text: "What can the HR department do to improve your employee experience?" }
    ]
  },
  {
    id: 5,
    title: "5. Work Environment",
    questions: [
      { id: "s5_q1", type: "rating", text: "Safety and security at the workplace." },
      { id: "s5_q2", type: "rating", text: "Cleanliness and maintenance of the office." },
      { id: "s5_q3", type: "rating", text: "Comfort and physical workspace layout." },
      { id: "s5_q4", type: "rating", text: "Collaboration and teamwork within the company." },
      { id: "s5_q5", type: "rating", text: "Inclusivity and diversity of the work environment." },
      { id: "s5_q6", type: "rating", text: "Overall energy and atmosphere of the office." },
      { id: "s5_open", type: "text", text: "Any suggestions for improving the work environment?" }
    ]
  },
  {
    id: 6,
    title: "6. Systems & Process",
    questions: [
      { id: "s6_q1", type: "rating", text: "Adequacy of software and tools to do your job." },
      { id: "s6_q2", type: "rating", text: "Response speed and support quality of the IT team." },
      { id: "s6_q3", type: "rating", text: "Clarity and speed of internal business processes." },
      { id: "s6_q4", type: "rating", text: "Training provided for new tools and systems." },
      { id: "s6_q5", type: "rating", text: "Adequacy of hardware (laptop, monitor, etc.) provided." },
      { id: "s6_open1", type: "text", text: "Which software/tool or process works best for you?" },
      { id: "s6_open2", type: "text", text: "Which software/tool or process slows you down the most?" }
    ]
  },
  {
    id: 7,
    title: "7. Productivity",
    questions: [
      { id: "s7_open1", type: "text", text: "What are the biggest blockers to your daily productivity?" },
      { id: "s7_open2", type: "text", text: "What changes would help you work more efficiently?" },
      { id: "s7_open3", type: "text", text: "How do you track and manage your daily goals?" }
    ]
  },
  {
    id: 8,
    title: "8. Revenue Ideas",
    questions: [
      { id: "s8_open1", type: "text", text: "Do you have ideas for new products or services the company could offer?" },
      { id: "s8_open2", type: "text", text: "How can we improve monetization of our current product/service offerings?" },
      { id: "s8_open3", type: "text", text: "What new markets or customer segments should we target?" },
      { id: "s8_open4", type: "text", text: "How can we increase repeat business from existing customers?" },
      { id: "s8_open5", type: "text", text: "Any pricing model improvements you would suggest?" }
    ]
  },
  {
    id: 9,
    title: "9. Cost Saving",
    questions: [
      { id: "s9_open1", type: "text", text: "Where do you see resource waste in your department or the company?" },
      { id: "s9_open2", type: "text", text: "What software tools or subscriptions can we consolidate or cancel?" },
      { id: "s9_open3", type: "text", text: "How can we optimize operational expenses (travel, electricity, etc.)?" }
    ]
  },
  {
    id: 10,
    title: "10. Customer Experience",
    questions: [
      { id: "s10_q1", type: "rating", text: "Customer perception of our product quality." },
      { id: "s10_q2", type: "rating", text: "Customer service and support quality." },
      { id: "s10_q3", type: "rating", text: "Speed of delivery or resolution for customers." },
      { id: "s10_q4", type: "rating", text: "Company responsiveness to customer feedback." },
      { id: "s10_open1", type: "text", text: "What is the most common customer complaint you hear?" },
      { id: "s10_open2", type: "text", text: "How can we delight our customers more?" }
    ]
  },
  {
    id: 11,
    title: "11. Compliance/Ethics",
    questions: [
      { id: "s11_y1", type: "yes_no", text: "Are you aware of the company's code of conduct and ethics policy?" },
      { id: "s11_y2", type: "yes_no", text: "Have you witnessed any policy violations in the last 12 months?" },
      { id: "s11_y3", type: "yes_no", text: "Do you feel safe reporting ethical concerns?" },
      { id: "s11_y4", type: "yes_no", text: "Is compliance training sufficient in the company?" },
      { id: "s11_y5", type: "yes_no", text: "Do you believe company decisions are made ethically?" },
      { id: "s11_open", type: "text", text: "Please explain any 'No' answers or share comments regarding compliance/ethics." }
    ]
  },
  {
    id: 12,
    title: "12. Training & Career",
    questions: [
      { id: "s12_q1", type: "rating", text: "Relevance of training programs to your current role." },
      { id: "s12_q2", type: "rating", text: "Clarity of career progression and promotion criteria." },
      { id: "s12_q3", type: "rating", text: "Opportunities for upskilling and learning new technologies." },
      { id: "s12_q4", type: "rating", text: "Mentorship and guidance support in the company." },
      { id: "s12_open1", type: "text", text: "What specific training or course would benefit you most right now?" },
      { id: "s12_open2", type: "text", text: "Where do you see yourself in the company in 2 years?" }
    ]
  },
  {
    id: 13,
    title: "13. Retention",
    questions: [
      {
        id: "s13_check",
        type: "checkbox",
        text: "What motivates you to stay at the company? (Select all that apply)",
        options: ["Competitive Salary", "Comprehensive Benefits", "Supportive Team", "Good Manager", "Work-Life Balance", "Interesting Work", "Career Growth Opportunities", "Brand Reputation"]
      },
      { id: "s13_open1", type: "text", text: "Have you considered leaving the company recently? (Why / Why not?)" },
      { id: "s13_open2", type: "text", text: "What key factors would make you stay here long-term?" }
    ]
  },
  {
    id: 14,
    title: "14. Innovation",
    questions: [
      { id: "s14_open1", type: "text", text: "What manual processes or workflows should the company automate?" },
      { id: "s14_open2", type: "text", text: "Suggest a major innovation for our core software or service line." },
      { id: "s14_open3", type: "text", text: "How can the company foster a more open and innovative culture?" }
    ]
  },
  {
    id: 15,
    title: "15. Ownership Index",
    questions: [
      { id: "s15_q1", type: "rating", text: "I take full responsibility for the outcomes of my work." },
      { id: "s15_q2", type: "rating", text: "I proactively solve problems rather than waiting for instructions." },
      { id: "s15_q3", type: "rating", text: "I actively help my team members when they face challenges." },
      { id: "s15_q4", type: "rating", text: "I follow through on all my tasks and commitments on time." },
      { id: "s15_q5", type: "rating", text: "I actively seek feedback to improve my performance." },
      { id: "s15_q6", type: "rating", text: "I align my day-to-day tasks with the team's goals." },
      { id: "s15_q7", type: "rating", text: "I act as an owner of the company, not just an employee." },
      { id: "s15_q8", type: "rating", text: "I suggest improvements rather than just pointing out problems." }
    ]
  },
  {
    id: 16,
    title: "16. Management Observation",
    questions: [
      {
        id: "s16_check",
        type: "checkbox_max3",
        text: "Select up to 3 characteristics that best describe our management style:",
        options: ["Collaborative", "Supportive", "Micro-managing", "Visionary", "Bureaucratic", "Empathetic", "Performance-driven", "Authoritative", "Communication-focused", "Inconsistent"]
      }
    ]
  },
  {
    id: 17,
    title: "17. Problem Solving",
    questions: [
      {
        id: "s17_mc1",
        type: "multiple_choice",
        text: "How do you prefer to resolve complex work issues?",
        options: [
          "Ask manager or senior developer immediately",
          "Research and suggest multiple solutions independently",
          "Collaborate with peers to brainstorm",
          "Postpone resolving until the deadline approaches"
        ]
      },
      {
        id: "s17_mc2",
        type: "multiple_choice",
        text: "When a team project fails, what is your first reaction?",
        options: [
          "Find out who made the mistake",
          "Identify root causes in the process and fix them",
          "Focus on fixing the issue immediately without finding fault",
          "Worry about who will take the blame"
        ]
      },
      { id: "s17_open", type: "text", text: "Describe a recent workplace challenge you solved and how you did it." }
    ]
  },
  {
    id: 18,
    title: "18. Quality & Detail",
    questions: [
      { id: "s18_q1", type: "rating", text: "I maintain high attention to detail in my tasks." },
      { id: "s18_q2", type: "rating", text: "I deliver work of consistent, high quality." },
      { id: "s18_q3", type: "rating", text: "I follow QA/review processes diligently." },
      { id: "s18_q4", type: "rating", text: "I actively try to reduce errors/bugs in my deliverables." },
      { id: "s18_q5", type: "rating", text: "I ensure my work is thoroughly documented." },
      { id: "s18_open1", type: "text", text: "How do you ensure high quality in your day-to-day work?" },
      { id: "s18_open2", type: "text", text: "What blocks you from delivering higher quality work?" }
    ]
  },
  {
    id: 19,
    title: "19. Courage & Honesty",
    questions: [
      {
        id: "s19_check",
        type: "checkbox",
        text: "Which behaviors do you regularly demonstrate or observe? (Select all that apply)",
        options: ["Speaking up in meetings", "Admitting mistakes openly", "Offering constructive disagreement", "Challenging the status quo", "Sharing bad news early"]
      },
      { id: "s19_open", type: "text", text: "Share a recent instance where courage or honesty was demonstrated or suppressed." }
    ]
  },
  {
    id: 20,
    title: "20. Growth Mindset",
    questions: [
      { id: "s20_q1", type: "rating", text: "I am open to constructive criticism." },
      { id: "s20_q2", type: "rating", text: "I actively seek out new learning opportunities." },
      { id: "s20_q3", type: "rating", text: "I adapt quickly to organizational changes." },
      { id: "s20_q4", type: "rating", text: "I view mistakes as opportunities to learn." },
      { id: "s20_q5", type: "rating", text: "I prefer working on challenging tasks over easy ones." },
      { id: "s20_open1", type: "text", text: "What new professional skill have you learned in the past 6 months?" },
      { id: "s20_open2", type: "text", text: "How does the company support your learning mindset?" }
    ]
  },
  {
    id: 21,
    title: "21. Confidential Questions",
    questions: [
      { id: "s21_open1", type: "text", text: "Is there anything you wish to report confidentially to HR/Admin?" },
      { id: "s21_open2", type: "text", text: "Do you feel secure in your position at the company?" },
      { id: "s21_open3", type: "text", text: "Are there any interpersonal conflicts within your team that concern you?" },
      { id: "s21_open4", type: "text", text: "Any other critical feedback that you want only HR/Admin to see?" }
    ]
  },
  {
    id: 22,
    title: "22. Direct Feedback",
    questions: [
      { id: "s22_open1", type: "text", text: "What is the single biggest change you would make to the company?" },
      { id: "s22_open2", type: "text", text: "What is the company's greatest strength?" },
      { id: "s22_open3", type: "text", text: "What is the company's greatest weakness?" },
      { id: "s22_open4", type: "text", text: "Any other comments, feedback, or concerns?" },
      { id: "s22_open5", type: "text", text: "How did you find this feedback survey format? (Helpful, tedious, etc.)" }
    ]
  }
];

export default function FeedbackList() {
  const { hasRole } = useAuth();
  const toast = useToast();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSurvey, setSelectedSurvey] = useState(null);
  const [activeModalSection, setActiveModalSection] = useState(1);
  const [filterType, setFilterType] = useState('all');

  const [activeListTab, setActiveListTab] = useState('submissions'); // 'submissions' | 'employees'
  const [employeeStatuses, setEmployeeStatuses] = useState([]);
  const [statusesLoading, setStatusesLoading] = useState(false);
  const [sendingRequest, setSendingRequest] = useState({});

  const fetchFeedback = async () => {
    setLoading(true);
    try {
      const endpoint = hasRole('super_admin') ? '/admin/feedback' : '/hr/feedback';
      const res = await api.get(endpoint);
      setSubmissions(res.data.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to fetch survey submissions.");
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployeeStatuses = async () => {
    setStatusesLoading(true);
    try {
      const endpoint = hasRole('super_admin') ? '/admin/feedback/employees' : '/hr/feedback/employees';
      const res = await api.get(endpoint);
      setEmployeeStatuses(res.data.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to fetch employee statuses.");
    } finally {
      setStatusesLoading(false);
    }
  };

  const handleSendRequest = async (employeeId) => {
    setSendingRequest(prev => ({ ...prev, [employeeId]: true }));
    try {
      const endpoint = hasRole('super_admin') 
        ? `/admin/feedback/send/${employeeId}` 
        : `/hr/feedback/send/${employeeId}`;
      await api.post(endpoint);
      toast.success("Feedback request sent successfully!");
      fetchEmployeeStatuses();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send feedback request.");
    } finally {
      setSendingRequest(prev => ({ ...prev, [employeeId]: false }));
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, []);

  useEffect(() => {
    if (activeListTab === 'employees') {
      fetchEmployeeStatuses();
    }
  }, [activeListTab]);

  const filteredSubmissions = submissions.filter(sub => {
    if (filterType === 'anonymous') return sub.is_anonymous;
    if (filterType === 'identified') return !sub.is_anonymous;
    return true;
  });

  const renderAnswer = (question, val) => {
    if (val === undefined || val === null || val === '' || (Array.isArray(val) && val.length === 0)) {
      return <span className="text-gray-400 dark:text-slate-600 italic text-xs">No response provided</span>;
    }

    if (question.type === 'rating') {
      return (
        <div className="flex items-center gap-1 mt-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-extrabold ${
                star <= val
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 dark:bg-slate-800 text-gray-400'
              }`}
            >
              {star}
            </span>
          ))}
        </div>
      );
    }

    if (question.type === 'yes_no') {
      return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
          val === 'Yes'
            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400'
            : 'bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400'
        }`}>
          {val}
        </span>
      );
    }

    if (question.type === 'checkbox' || question.type === 'checkbox_max3') {
      const list = Array.isArray(val) ? val : [val];
      return (
        <div className="flex flex-wrap gap-1 mt-1">
          {list.map((item, i) => (
            <span key={i} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-semibold text-gray-700 dark:text-slate-300">
              {item}
            </span>
          ))}
        </div>
      );
    }

    return (
      <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 italic border-l-2 border-indigo-500/20 pl-2 py-0.5 bg-slate-50/50 dark:bg-slate-800/10 rounded max-w-2xl whitespace-pre-wrap">
        {val}
      </p>
    );
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Feedback Surveys</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage employee feedback survey requests and view submissions.
          </p>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-gray-200 dark:border-slate-800">
        <button
          onClick={() => setActiveListTab('submissions')}
          className={`px-5 py-3 border-b-2 font-bold text-sm transition-all ${
            activeListTab === 'submissions'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-slate-300'
          }`}
        >
          📝 Feedback Responses
        </button>
        <button
          onClick={() => setActiveListTab('employees')}
          className={`px-5 py-3 border-b-2 font-bold text-sm transition-all ${
            activeListTab === 'employees'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-slate-300'
          }`}
        >
          👥 Employee Status & Send Request
        </button>
      </div>

      {activeListTab === 'submissions' ? (
        <>
          {/* Filter Bar */}
          <div className="flex justify-end">
            <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-gray-200/60 dark:border-slate-800 p-1.5 rounded-xl shadow-sm">
              <button
                onClick={() => setFilterType('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  filterType === 'all'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-gray-500 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                All Submissions
              </button>
              <button
                onClick={() => setFilterType('identified')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  filterType === 'identified'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-gray-500 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                Identified
              </button>
              <button
                onClick={() => setFilterType('anonymous')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  filterType === 'anonymous'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-gray-500 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                Anonymous
              </button>
            </div>
          </div>

          {/* Main Submissions Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200/60 dark:border-slate-800 shadow-sm overflow-hidden animate-in fade-in duration-200">
            {loading ? (
              <div className="p-12 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="mt-3 text-sm text-gray-500">Loading survey responses...</p>
              </div>
            ) : filteredSubmissions.length === 0 ? (
              <div className="p-12 text-center">
                <div className="text-gray-300 text-4xl mb-2">📝</div>
                <p className="text-gray-500 text-sm font-semibold">No survey submissions found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/75 dark:bg-slate-800/40 text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase tracking-wider border-b border-gray-100 dark:border-slate-800">
                      <th className="px-6 py-4">Employee</th>
                      <th className="px-6 py-4">Employee Code</th>
                      <th className="px-6 py-4">Department</th>
                      <th className="px-6 py-4">Anonymity</th>
                      <th className="px-6 py-4">Submitted At</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-slate-800/60 text-sm">
                    {filteredSubmissions.map((sub) => (
                      <tr key={sub.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/20 text-gray-700 dark:text-slate-300 transition-colors">
                        <td className="px-6 py-4">
                          {sub.is_anonymous ? (
                            <span className="font-semibold text-gray-400 dark:text-slate-500 italic">Anonymous</span>
                          ) : (
                            <span className="font-semibold text-gray-900 dark:text-white">{sub.employee?.name}</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-xs font-mono text-gray-500">
                          {sub.is_anonymous ? '—' : sub.employee?.employee_code}
                        </td>
                        <td className="px-6 py-4 text-xs text-gray-600 dark:text-gray-400">
                          {sub.is_anonymous ? '—' : sub.employee?.department?.name || 'N/A'}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            sub.is_anonymous
                              ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400'
                              : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400'
                          }`}>
                            {sub.is_anonymous ? 'Anonymous' : 'Identified'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                          {sub.submitted_at}
                        </td>
                        <td className="px-6 py-4 text-right whitespace-nowrap">
                          <button
                            onClick={() => {
                              setSelectedSurvey(sub);
                              setActiveModalSection(1);
                            }}
                            className="text-xs text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-bold border border-indigo-200 dark:border-indigo-900/30 px-3 py-1.5 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950/20 transition-all shadow-sm"
                          >
                            View Responses
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      ) : (
        /* Employee Statuses Table (For Sending Requests) */
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200/60 dark:border-slate-800 shadow-sm overflow-hidden animate-in fade-in duration-200">
          {statusesLoading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-3 text-sm text-gray-500">Loading employees statuses...</p>
            </div>
          ) : employeeStatuses.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-gray-300 text-4xl mb-2">👥</div>
              <p className="text-gray-500 text-sm font-semibold">No employees found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/75 dark:bg-slate-800/40 text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase tracking-wider border-b border-gray-100 dark:border-slate-800">
                    <th className="px-6 py-4">Employee</th>
                    <th className="px-6 py-4">Employee Code</th>
                    <th className="px-6 py-4">Department</th>
                    <th className="px-6 py-4">Survey Status</th>
                    <th className="px-6 py-4">Request Log</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-800/60 text-sm">
                  {employeeStatuses.map((emp) => {
                    const isSubmittingRequest = sendingRequest[emp.id];
                    return (
                      <tr key={emp.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/20 text-gray-700 dark:text-slate-300 transition-colors">
                        <td className="px-6 py-4">
                          <span className="font-semibold text-gray-900 dark:text-white">{emp.name}</span>
                        </td>
                        <td className="px-6 py-4 text-xs font-mono text-gray-500">
                          {emp.employee_code}
                        </td>
                        <td className="px-6 py-4 text-xs text-gray-600 dark:text-gray-400">
                          {emp.department}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            emp.status === 'submitted'
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400'
                              : emp.status === 'pending'
                              ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400'
                              : 'bg-gray-50 text-gray-600 dark:bg-slate-850 dark:text-slate-400'
                          }`}>
                            {emp.status === 'submitted' ? 'Submitted' : emp.status === 'pending' ? 'Pending Request' : 'No Request'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs text-gray-500">
                          {emp.sent_at ? `Requested on ${emp.sent_at}` : '—'}
                        </td>
                        <td className="px-6 py-4 text-right whitespace-nowrap">
                          {emp.status === 'submitted' ? (
                            <span className="text-xs text-emerald-500 font-bold pr-3">Completed ✓</span>
                          ) : (
                            <button
                              onClick={() => handleSendRequest(emp.id)}
                              disabled={isSubmittingRequest}
                              className="text-xs text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-bold border border-indigo-200 dark:border-indigo-900/30 px-3 py-1.5 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950/20 transition-all shadow-sm disabled:opacity-40"
                            >
                              {isSubmittingRequest ? 'Sending...' : emp.status === 'pending' ? 'Resend Request' : 'Send Request'}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Details Modal */}
      {selectedSurvey && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-gray-200/60 dark:border-slate-800 rounded-2xl max-w-5xl w-full h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50 dark:bg-slate-850">
              <div>
                <h3 className="text-lg font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                  <span>📊</span> Survey Detail View
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Submitted by {selectedSurvey.is_anonymous ? 'Anonymous' : selectedSurvey.employee?.name} on {selectedSurvey.submitted_at}
                </p>
              </div>
              <button
                onClick={() => setSelectedSurvey(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors text-lg"
              >
                ✕
              </button>
            </div>

            {/* Modal Body (Columns: Nav Sidebar + Content) */}
            <div className="flex-1 min-h-0 flex">
              {/* Inner Tabs Sidebar */}
              <div className="w-1/4 border-r border-gray-100 dark:border-slate-800 overflow-y-auto bg-slate-50/50 dark:bg-slate-900/40 p-3 space-y-1">
                {SECTIONS.map((sec) => (
                  <button
                    key={sec.id}
                    onClick={() => setActiveModalSection(sec.id)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                      activeModalSection === sec.id
                        ? 'bg-indigo-600 text-white shadow'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-gray-600 dark:text-slate-400'
                    }`}
                  >
                    {sec.title}
                  </button>
                ))}
              </div>

              {/* Inner Answers content */}
              <div className="w-3/4 p-6 sm:p-8 overflow-y-auto space-y-6">
                <h4 className="text-base font-extrabold text-gray-900 dark:text-white border-b border-gray-100 dark:border-slate-800 pb-2">
                  {SECTIONS.find(s => s.id === activeModalSection)?.title}
                </h4>

                <div className="space-y-6">
                  {SECTIONS.find(s => s.id === activeModalSection)?.questions.map((q, idx) => {
                    const ansVal = selectedSurvey.answers[q.id];
                    return (
                      <div key={q.id} className="space-y-1">
                        <div className="flex items-start gap-2">
                          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">{idx + 1}.</span>
                          <span className="text-xs font-bold text-gray-800 dark:text-slate-200">
                            {q.text}
                          </span>
                        </div>
                        <div className="pl-5">
                          {renderAnswer(q, ansVal)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between shrink-0">
              <button
                type="button"
                onClick={() => setActiveModalSection(p => Math.max(1, p - 1))}
                disabled={activeModalSection === 1}
                className="px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-850 disabled:opacity-40 transition-colors"
              >
                ← Previous Section
              </button>
              <button
                type="button"
                onClick={() => setActiveModalSection(p => Math.min(SECTIONS.length, p + 1))}
                disabled={activeModalSection === SECTIONS.length}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all disabled:opacity-40 shadow-sm"
              >
                Next Section →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
