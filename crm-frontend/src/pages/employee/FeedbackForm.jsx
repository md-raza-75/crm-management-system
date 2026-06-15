import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
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

export default function FeedbackForm() {
  const toast = useToast();
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [activeTab, setActiveTab] = useState(1);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(true);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await api.get('/employee/feedback/status');
        setHasSubmitted(res.data.has_submitted);
      } catch (err) {
        console.error("Failed to check feedback status", err);
      } finally {
        setLoadingStatus(false);
      }
    };
    checkStatus();
  }, []);

  const handleRatingChange = (qId, ratingValue) => {
    setAnswers(prev => ({ ...prev, [qId]: ratingValue }));
  };

  const handleTextChange = (qId, textValue) => {
    setAnswers(prev => ({ ...prev, [qId]: textValue }));
  };

  const handleCheckboxChange = (qId, option, isChecked, maxSelections = null) => {
    setAnswers(prev => {
      const currentSelections = prev[qId] || [];
      if (isChecked) {
        if (maxSelections && currentSelections.length >= maxSelections) {
          toast.warning(`You can select a maximum of ${maxSelections} options.`);
          return prev;
        }
        return { ...prev, [qId]: [...currentSelections, option] };
      } else {
        return { ...prev, [qId]: currentSelections.filter(o => o !== option) };
      }
    });
  };

  const handleMultipleChoiceChange = (qId, optionValue) => {
    setAnswers(prev => ({ ...prev, [qId]: optionValue }));
  };

  const handleYesNoChange = (qId, val) => {
    setAnswers(prev => ({ ...prev, [qId]: val }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/employee/feedback/submit', {
        is_anonymous: isAnonymous,
        answers: answers
      });
      toast.success("Feedback Survey submitted successfully! Thank you for your input.");
      setSubmitted(true);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit survey. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingStatus) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (hasSubmitted) {
    return (
      <div className="max-w-4xl mx-auto mt-12 p-8 bg-white dark:bg-slate-900 border border-gray-200/60 dark:border-slate-800 rounded-3xl shadow-xl text-center space-y-6 animate-in fade-in zoom-in duration-300">
        <div className="w-20 h-20 bg-amber-50 dark:bg-amber-950/20 text-amber-500 rounded-full flex items-center justify-center mx-auto text-4xl shadow-inner animate-pulse">
          ⚠️
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Already Submitted</h1>
        <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
          You have already submitted your feedback survey response. Each employee is limited to one submission.
        </p>
        <Link
          to="/dashboard"
          className="inline-block px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-md shadow-indigo-600/10 hover:shadow-lg"
        >
          Go to Dashboard
        </Link>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="max-w-4xl mx-auto mt-12 p-8 bg-white dark:bg-slate-900 border border-gray-200/60 dark:border-slate-800 rounded-3xl shadow-xl text-center space-y-6 animate-in fade-in zoom-in duration-300">
        <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto text-4xl shadow-inner animate-bounce">
          ✓
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Thank You!</h1>
        <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
          Your feedback has been recorded successfully. We appreciate your honesty and diligence in helping us build a better workplace.
        </p>
        <Link
          to="/dashboard"
          className="inline-block px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-md shadow-indigo-600/10 hover:shadow-lg"
        >
          Go to Dashboard
        </Link>
      </div>
    );
  }

  const activeSection = SECTIONS.find(s => s.id === activeTab);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white dark:bg-slate-900 border border-gray-200/60 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
            <span>📝</span> Employee Feedback Survey
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Please fill out all 22 sections. Your honest answers help shape our organization.
          </p>
        </div>

        {/* Anonymous Toggle */}
        <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/40 border border-gray-200/40 dark:border-slate-700/30 px-4 py-2.5 rounded-xl">
          <label htmlFor="anonymous-checkbox" className="text-sm font-semibold text-gray-700 dark:text-slate-300 cursor-pointer">
            Submit Anonymously
          </label>
          <input
            id="anonymous-checkbox"
            type="checkbox"
            checked={isAnonymous}
            onChange={(e) => setIsAnonymous(e.target.checked)}
            className="w-5 h-5 rounded border-gray-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500 transition cursor-pointer"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Navigation Sidebar (Tabs) */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 border border-gray-200/60 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden h-[calc(100vh-220px)] overflow-y-auto sticky top-6">
          <div className="p-4 border-b border-gray-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/20">
            <span className="text-xs font-extrabold text-gray-400 dark:text-slate-500 uppercase tracking-wider">Survey Sections</span>
          </div>
          <nav className="p-2 space-y-1">
            {SECTIONS.map((sec) => {
              const isActive = activeTab === sec.id;
              // Check if any questions in this section have been answered
              const answeredCount = sec.questions.filter(q => answers[q.id] !== undefined && answers[q.id] !== '').length;
              const isCompleted = answeredCount === sec.questions.length;
              const isPartiallyAnswered = answeredCount > 0 && answeredCount < sec.questions.length;

              return (
                <button
                  key={sec.id}
                  onClick={() => setActiveTab(sec.id)}
                  className={`w-full text-left flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 text-gray-700 dark:text-slate-300'
                  }`}
                >
                  <span className="truncate pr-1">{sec.title}</span>
                  <span className={`w-2 h-2 rounded-full shrink-0 ${
                    isCompleted ? 'bg-emerald-500' : isPartiallyAnswered ? 'bg-amber-400' : 'bg-gray-200 dark:bg-slate-700'
                  }`} />
                </button>
              );
            })}
          </nav>
        </div>

        {/* Section Form Content */}
        <div className="lg:col-span-3 space-y-6">
          <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 border border-gray-200/60 dark:border-slate-800 rounded-2xl shadow-sm p-6 sm:p-8 space-y-8">
            <div>
              <h2 className="text-xl font-extrabold text-gray-900 dark:text-white border-b border-gray-100 dark:border-slate-800 pb-3">
                {activeSection.title}
              </h2>
            </div>

            <div className="space-y-8">
              {activeSection.questions.map((q, idx) => (
                <div key={q.id} className="space-y-3">
                  <div className="flex gap-2">
                    <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400 shrink-0">{idx + 1}.</span>
                    <label className="text-sm font-bold text-gray-800 dark:text-slate-200 leading-relaxed">
                      {q.text}
                    </label>
                  </div>

                  {/* Rating Type (1-5 Radio Buttons) */}
                  {q.type === 'rating' && (
                    <div className="flex items-center gap-3 pt-2 max-w-md">
                      <span className="text-xs text-gray-400 font-semibold pr-1">Disagree</span>
                      {[1, 2, 3, 4, 5].map((val) => {
                        const isSelected = answers[q.id] === val;
                        return (
                          <label
                            key={val}
                            className={`flex-1 h-11 flex items-center justify-center rounded-xl border text-sm font-extrabold cursor-pointer transition-all ${
                              isSelected
                                ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-600/10'
                                : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800/40 text-gray-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80'
                            }`}
                          >
                            <input
                              type="radio"
                              name={q.id}
                              value={val}
                              checked={isSelected}
                              onChange={() => handleRatingChange(q.id, val)}
                              className="sr-only"
                            />
                            {val}
                          </label>
                        );
                      })}
                      <span className="text-xs text-gray-400 font-semibold pl-1">Agree</span>
                    </div>
                  )}

                  {/* Text Type (Textarea) */}
                  {q.type === 'text' && (
                    <textarea
                      value={answers[q.id] || ''}
                      onChange={(e) => handleTextChange(q.id, e.target.value)}
                      placeholder="Write your feedback here..."
                      rows="3"
                      className="w-full border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm bg-white dark:bg-slate-800/20 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-400 transition"
                    />
                  )}

                  {/* Checkbox Type */}
                  {(q.type === 'checkbox' || q.type === 'checkbox_max3') && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                      {q.options.map((option) => {
                        const isChecked = (answers[q.id] || []).includes(option);
                        return (
                          <label
                            key={option}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all ${
                              isChecked
                                ? 'bg-indigo-50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-900/30 text-indigo-700 dark:text-indigo-400 font-bold'
                                : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800/40 text-gray-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => handleCheckboxChange(q.id, option, e.target.checked, q.type === 'checkbox_max3' ? 3 : null)}
                              className="w-4 h-4 rounded text-indigo-600 border-gray-300 dark:border-slate-700 focus:ring-indigo-500"
                            />
                            <span className="text-xs">{option}</span>
                          </label>
                        );
                      })}
                    </div>
                  )}

                  {/* Multiple Choice Type */}
                  {q.type === 'multiple_choice' && (
                    <div className="space-y-2.5 pt-1">
                      {q.options.map((option) => {
                        const isSelected = answers[q.id] === option;
                        return (
                          <label
                            key={option}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all ${
                              isSelected
                                ? 'bg-indigo-50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-900/30 text-indigo-700 dark:text-indigo-400 font-bold'
                                : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800/40 text-gray-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80'
                            }`}
                          >
                            <input
                              type="radio"
                              name={q.id}
                              value={option}
                              checked={isSelected}
                              onChange={() => handleMultipleChoiceChange(q.id, option)}
                              className="w-4 h-4 text-indigo-600 border-gray-300 dark:border-slate-700 focus:ring-indigo-500"
                            />
                            <span className="text-xs">{option}</span>
                          </label>
                        );
                      })}
                    </div>
                  )}

                  {/* Yes/No Type */}
                  {q.type === 'yes_no' && (
                    <div className="flex items-center gap-4 pt-1 max-w-[240px]">
                      {['Yes', 'No'].map((val) => {
                        const isSelected = answers[q.id] === val;
                        return (
                          <label
                            key={val}
                            className={`flex-1 h-10 flex items-center justify-center rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                              isSelected
                                ? val === 'Yes'
                                  ? 'bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-500/10'
                                  : 'bg-rose-500 border-rose-500 text-white shadow-md shadow-rose-500/10'
                                : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800/40 text-gray-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80'
                            }`}
                          >
                            <input
                              type="radio"
                              name={q.id}
                              value={val}
                              checked={isSelected}
                              onChange={() => handleYesNoChange(q.id, val)}
                              className="sr-only"
                            />
                            {val}
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between border-t border-gray-100 dark:border-slate-800 pt-6">
              <button
                type="button"
                onClick={() => setActiveTab(p => Math.max(1, p - 1))}
                disabled={activeTab === 1}
                className="px-5 py-2 rounded-xl border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800/60 disabled:opacity-40 transition-colors"
              >
                ← Previous Section
              </button>

              {activeTab < SECTIONS.length ? (
                <button
                  type="button"
                  onClick={() => setActiveTab(p => Math.min(SECTIONS.length, p + 1))}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-indigo-600/10 hover:shadow-lg"
                >
                  Next Section →
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-extrabold rounded-xl transition-all shadow-md shadow-emerald-500/10 hover:shadow-lg disabled:opacity-50"
                >
                  {submitting ? 'Submitting Survey...' : '✓ Submit Full Feedback'}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
