'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useRouter } from 'next/navigation';
import { registerTeamAction } from '@/actions/registration-actions';
import {
  Users,
  UserPlus,
  Trash2,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
  Building,
  User,
  CheckSquare,
} from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Form State
  const [teamName, setTeamName] = useState('');
  const [college, setCollege] = useState('N/A');
  const [department, setDepartment] = useState('');
  const [city, setCity] = useState('');

  const [leaderName, setLeaderName] = useState('');
  const [leaderEmail, setLeaderEmail] = useState('');
  const [leaderPhone, setLeaderPhone] = useState('');

  const [members, setMembers] = useState<
    Array<{ fullName: string; department: string; year: string }>
  >([
    { fullName: '', department: '', year: '1st Year' },
  ]);

  const [termsAgreed, setTermsAgreed] = useState(false);
  const [consentAgreed, setConsentAgreed] = useState(false);

  // Dynamic Add Member
  function addMember() {
    if (members.length >= 4) {
      setErrorMsg('Maximum team size limit reached (5 total including leader).');
      return;
    }
    setMembers([...members, { fullName: '', department: '', year: '1st Year' }]);
  }

  // Dynamic Remove Member
  function removeMember(index: number) {
    setMembers(members.filter((_, i) => i !== index));
  }

  function updateMember(index: number, field: string, value: string) {
    const updated = [...members];
    updated[index] = { ...updated[index], [field]: value };
    setMembers(updated);
  }

  function validateStep(currentStep: number): boolean {
    setErrorMsg('');

    if (currentStep === 1) {
      if (!teamName.trim() || !department.trim() || !city.trim()) {
        setErrorMsg('Please fill in all team details.');
        return false;
      }
    }

    if (currentStep === 2) {
      if (!leaderName.trim() || !leaderEmail.trim() || !leaderPhone.trim()) {
        setErrorMsg('Please fill in all leader information.');
        return false;
      }
      if (!/\S+@\S+\.\S+/.test(leaderEmail)) {
        setErrorMsg('Please enter a valid leader email address.');
        return false;
      }
    }

    if (currentStep === 3) {
      for (let i = 0; i < members.length; i++) {
        const m = members[i];
        if (m.fullName.trim()) {
          if (!m.fullName.trim() || !m.department.trim()) {
            setErrorMsg(`Please enter Full Name and Department for Team Member ${i + 1}.`);
            return false;
          }
        }
      }
    }

    if (currentStep === 4) {
      if (!termsAgreed || !consentAgreed) {
        setErrorMsg('You must accept the Terms & Conditions and Consent checkboxes to proceed.');
        return false;
      }
    }

    return true;
  }

  function handleNext() {
    if (validateStep(step)) {
      setStep((prev) => prev + 1);
    }
  }

  function handleBack() {
    setErrorMsg('');
    setStep((prev) => prev - 1);
  }

  async function handleSubmit() {
    if (!validateStep(4)) return;

    setLoading(true);
    setErrorMsg('');

    // Filter non-empty member entries
    const validMembers = members.filter((m) => m.fullName.trim());

    const res = await registerTeamAction({
      name: teamName,
      college: college || 'N/A',
      department,
      city,
      leaderName,
      leaderEmail,
      leaderPhone,
      members: validMembers,
    });

    setLoading(false);

    if (!res.success) {
      setErrorMsg(res.error || 'Registration failed. Please try again.');
    } else if (res.teamId) {
      // Redirect to Registration Success Page
      router.push(`/register/success/${res.teamId}`);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#05070A] subtle-grid-bg">
      <Navbar />

      <main className="flex-1 py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
        
        {/* Page Title */}
        <div className="text-center space-y-3 mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#071426] border border-[#147BFF]/30 text-[#147BFF] text-xs font-bold uppercase tracking-widest">
            <ShieldCheck className="w-3.5 h-3.5" />
            ZeroTrace Verified Registration
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight uppercase">
            REGISTER YOUR TEAM
          </h1>
          <p className="text-sm text-[#AAB4C3]">
            EUREKA! – Road To Enterprise 2026
          </p>
        </div>

        {/* Multi-Step Wizard Progress Bar */}
        <div className="glass-panel p-4 rounded-2xl border border-[#1E293B] mb-8">
          <div className="flex items-center justify-between text-xs font-bold text-[#AAB4C3]">
            <div className={`flex items-center gap-2 ${step >= 1 ? 'text-[#147BFF]' : ''}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 1 ? 'bg-[#147BFF] text-white' : 'bg-[#0B1F3A]'}`}>1</span>
              <span className="hidden sm:inline">Team Details</span>
            </div>
            <div className="w-8 h-px bg-[#1E293B]"></div>
            <div className={`flex items-center gap-2 ${step >= 2 ? 'text-[#147BFF]' : ''}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 2 ? 'bg-[#147BFF] text-white' : 'bg-[#0B1F3A]'}`}>2</span>
              <span className="hidden sm:inline">Leader Info</span>
            </div>
            <div className="w-8 h-px bg-[#1E293B]"></div>
            <div className={`flex items-center gap-2 ${step >= 3 ? 'text-[#147BFF]' : ''}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 3 ? 'bg-[#147BFF] text-white' : 'bg-[#0B1F3A]'}`}>3</span>
              <span className="hidden sm:inline">Members</span>
            </div>
            <div className="w-8 h-px bg-[#1E293B]"></div>
            <div className={`flex items-center gap-2 ${step >= 4 ? 'text-[#147BFF]' : ''}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 4 ? 'bg-[#147BFF] text-white' : 'bg-[#0B1F3A]'}`}>4</span>
              <span className="hidden sm:inline">Review</span>
            </div>
          </div>
        </div>

        {/* Error Alert Box */}
        {errorMsg && (
          <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-start gap-3 text-rose-300 text-xs">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">REGISTRATION ERROR</p>
              <p className="mt-0.5">{errorMsg}</p>
            </div>
          </div>
        )}

        {/* Form Container */}
        <div className="glass-panel p-8 rounded-3xl border border-[#147BFF]/30 space-y-8">
          
          {/* STEP 1: TEAM INFORMATION */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="border-b border-[#1E293B] pb-4">
                <h2 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Building className="w-5 h-5 text-[#147BFF]" />
                  STEP 1 — EVENT & TEAM INFORMATION
                </h2>
                <p className="text-xs text-[#AAB4C3] mt-1">Provide institution and team identification.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-[#AAB4C3] block mb-1.5">
                    TEAM NAME *
                  </label>
                  <input
                    type="text"
                    required
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    placeholder="e.g. Nexus Innovators"
                    className="w-full bg-[#05070A] border border-[#1E293B] focus:border-[#147BFF] rounded-xl px-4 py-3 text-sm text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#AAB4C3] block mb-1.5">
                    DEPARTMENT / BRANCH *
                  </label>
                  <input
                    type="text"
                    required
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="e.g. Computer Science & Eng"
                    className="w-full bg-[#05070A] border border-[#1E293B] focus:border-[#147BFF] rounded-xl px-4 py-3 text-sm text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#AAB4C3] block mb-1.5">
                  CITY / LOCATION *
                </label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Bangalore"
                  className="w-full bg-[#05070A] border border-[#1E293B] focus:border-[#147BFF] rounded-xl px-4 py-3 text-sm text-white focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* STEP 2: TEAM LEADER DETAILS */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="border-b border-[#1E293B] pb-4">
                <h2 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <User className="w-5 h-5 text-[#147BFF]" />
                  STEP 2 — TEAM LEADER DETAILS
                </h2>
                <p className="text-xs text-[#AAB4C3] mt-1">The primary point of contact for ticket delivery and event updates.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-[#AAB4C3] block mb-2">
                    FULL NAME *
                  </label>
                  <input
                    type="text"
                    value={leaderName}
                    onChange={(e) => setLeaderName(e.target.value)}
                    placeholder="e.g. Alex Rivera"
                    className="w-full bg-[#05070A] border border-[#1E293B] focus:border-[#147BFF] rounded-xl px-4 py-3 text-sm text-white focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs font-semibold text-[#AAB4C3] block mb-2">
                      EMAIL ADDRESS *
                    </label>
                    <input
                      type="email"
                      value={leaderEmail}
                      onChange={(e) => setLeaderEmail(e.target.value)}
                      placeholder="alex@example.com"
                      className="w-full bg-[#05070A] border border-[#1E293B] focus:border-[#147BFF] rounded-xl px-4 py-3 text-sm text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[#AAB4C3] block mb-2">
                      PHONE NUMBER *
                    </label>
                    <input
                      type="tel"
                      value={leaderPhone}
                      onChange={(e) => setLeaderPhone(e.target.value)}
                      placeholder="+1 (555) 014-2980"
                      className="w-full bg-[#05070A] border border-[#1E293B] focus:border-[#147BFF] rounded-xl px-4 py-3 text-sm text-white focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: TEAM MEMBERS (Name, Department, Year) */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-[#1E293B] pb-4">
                <div>
                  <h2 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Users className="w-5 h-5 text-[#147BFF]" />
                    STEP 3 — TEAM MEMBERS
                  </h2>
                  <p className="text-xs text-[#AAB4C3] mt-1">Enter your team mates' Name, Department, and Academic Year (no email or phone required).</p>
                </div>
                <button
                  onClick={addMember}
                  type="button"
                  className="px-4 py-2 bg-[#071426] hover:bg-[#0B1F3A] border border-[#147BFF]/40 text-xs font-bold text-[#147BFF] rounded-xl flex items-center gap-2 transition-all"
                >
                  <UserPlus className="w-4 h-4" />
                  + ADD MEMBER
                </button>
              </div>

              {members.map((member, idx) => (
                <div key={idx} className="bg-[#05070A] p-5 rounded-2xl border border-[#1E293B] space-y-4 relative">
                  <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
                    <span className="text-xs font-bold text-[#147BFF] uppercase tracking-wider">
                      TEAM MEMBER #{idx + 1}
                    </span>
                    {members.length > 0 && (
                      <button
                        onClick={() => removeMember(idx)}
                        type="button"
                        className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="text-[11px] font-semibold text-[#AAB4C3] block mb-1">
                        FULL NAME *
                      </label>
                      <input
                        type="text"
                        value={member.fullName}
                        onChange={(e) => updateMember(idx, 'fullName', e.target.value)}
                        placeholder="Member Full Name"
                        className="w-full bg-[#071426] border border-[#1E293B] focus:border-[#147BFF] rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-[#AAB4C3] block mb-1">
                        DEPARTMENT *
                      </label>
                      <input
                        type="text"
                        value={member.department}
                        onChange={(e) => updateMember(idx, 'department', e.target.value)}
                        placeholder="e.g. Computer Science"
                        className="w-full bg-[#071426] border border-[#1E293B] focus:border-[#147BFF] rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-[#AAB4C3] block mb-1">
                        ACADEMIC YEAR *
                      </label>
                      <select
                        value={member.year}
                        onChange={(e) => updateMember(idx, 'year', e.target.value)}
                        className="w-full bg-[#071426] border border-[#1E293B] focus:border-[#147BFF] rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                      >
                        <option value="1st Year">1st Year</option>
                        <option value="2nd Year">2nd Year</option>
                        <option value="3rd Year">3rd Year</option>
                        <option value="4th Year">4th Year</option>
                        <option value="Post Graduate">Post Graduate</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* STEP 4: REVIEW & CONFIRMATION */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="border-b border-[#1E293B] pb-4">
                <h2 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <CheckSquare className="w-5 h-5 text-[#147BFF]" />
                  STEP 4 — REVIEW & TERMS CONSENT
                </h2>
                <p className="text-xs text-[#AAB4C3] mt-1">Review your submission details before final registration.</p>
              </div>

              {/* Summary Review Card */}
              <div className="bg-[#05070A] p-6 rounded-2xl border border-[#1E293B] space-y-4 text-xs">
                <div className="border-b border-[#1E293B] pb-3">
                  <span className="text-[10px] font-bold text-[#147BFF] uppercase">TEAM INFORMATION</span>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <p><span className="text-[#AAB4C3]">Team Name:</span> <strong className="text-white">{teamName}</strong></p>
                    <p><span className="text-[#AAB4C3]">College:</span> <strong className="text-white">{college}</strong></p>
                    <p><span className="text-[#AAB4C3]">Department:</span> <strong className="text-white">{department}</strong></p>
                    <p><span className="text-[#AAB4C3]">City:</span> <strong className="text-white">{city}</strong></p>
                  </div>
                </div>

                <div className="border-b border-[#1E293B] pb-3">
                  <span className="text-[10px] font-bold text-[#147BFF] uppercase">TEAM LEADER</span>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <p><span className="text-[#AAB4C3]">Name:</span> <strong className="text-white">{leaderName}</strong></p>
                    <p><span className="text-[#AAB4C3]">Email:</span> <strong className="text-white">{leaderEmail}</strong></p>
                    <p><span className="text-[#AAB4C3]">Phone:</span> <strong className="text-white">{leaderPhone}</strong></p>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-[#147BFF] uppercase">TEAM MEMBERS ({1 + members.filter(m=>m.fullName).length})</span>
                  <ul className="mt-2 space-y-1">
                    {members.filter(m=>m.fullName).map((m, i) => (
                      <li key={i} className="text-[#AAB4C3]">
                        #{i + 1}: <strong className="text-white">{m.fullName}</strong> ({m.department || 'Dept'} • {m.year || '1st Year'})
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Checkboxes */}
              <div className="space-y-3 pt-2">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={termsAgreed}
                    onChange={(e) => setTermsAgreed(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded accent-[#147BFF]"
                  />
                  <span className="text-xs text-[#AAB4C3]">
                    I agree to the <strong className="text-white">Terms & Conditions</strong> of EUREKA! – Road To Enterprise 2026 and ZeroTrace guidelines.
                  </span>
                </label>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consentAgreed}
                    onChange={(e) => setConsentAgreed(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded accent-[#147BFF]"
                  />
                  <span className="text-xs text-[#AAB4C3]">
                    I consent to ZeroTrace storing team registration details and sending digital QR tickets to the team leader's email.
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-6 border-t border-[#1E293B]">
            {step > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                disabled={loading}
                className="px-6 py-3 bg-[#071426] hover:bg-[#0B1F3A] border border-[#1E293B] text-xs font-bold text-white rounded-xl flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                BACK
              </button>
            ) : (
              <div></div>
            )}

            {step < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-8 py-3.5 bg-[#147BFF] hover:bg-[#0062E6] font-bold text-xs text-white rounded-xl flex items-center gap-2 shadow-lg shadow-[#147BFF]/20"
              >
                CONTINUE
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="px-8 py-3.5 bg-emerald-500 hover:bg-emerald-600 font-bold text-xs text-white rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-500/20 disabled:opacity-50"
              >
                {loading ? 'SUBMITTING REGISTRATION...' : 'CONFIRM & SUBMIT REGISTRATION'}
                <CheckCircle2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
