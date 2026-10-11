import React from 'react';

import {

  Volume2,

  Volume1,

  VolumeX,

  RotateCcw,

  Bot,

  CheckCircle2,

} from 'lucide-react';



interface AIInterviewerAvatarProps {

  isSpeaking: boolean;

  isCandidateAnswering: boolean;

  currentQuestionNumber: number;

  questionCategory: string;

  speechVolume: number;

  onVolumeChange: (newVolume: number) => void;

  onToggleSpeak: () => void;

  onReplaySpeak: () => void;

  className?: string;

}



export const AIInterviewerAvatar: React.FC<AIInterviewerAvatarProps> = ({

  isSpeaking,

  isCandidateAnswering,

  questionCategory,

  speechVolume,

  onVolumeChange,

  onToggleSpeak,

  onReplaySpeak,

  className = '',

}) => {

  const volumePercentage = Math.round(speechVolume * 100);



  const getVolumeIcon = () => {

    if (speechVolume === 0) return <VolumeX className="w-3.5 h-3.5 text-rose-400" />;

    if (speechVolume < 0.5) return <Volume1 className="w-3.5 h-3.5 text-indigo-400" />;

    return <Volume2 className="w-3.5 h-3.5 text-indigo-400" />;

  };



  return (

    <div

      className={`relative w-full rounded-2xl overflow-hidden bg-gradient-to-b from-slate-900 via-slate-950 to-indigo-950 border border-slate-800 shadow-lg flex flex-col justify-between transition-all group ${

        isSpeaking ? 'ring-2 ring-indigo-500/80 shadow-indigo-950/30' : ''

      } ${className}`}

      style={{ aspectRatio: '16 / 10' }}

    >

      {/* Background Studio Ambience */}

      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">

        {/* Soft studio lights */}

        <div className="absolute -top-12 -left-12 w-48 h-48 bg-indigo-600/15 rounded-full blur-3xl" />

        <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-blue-600/15 rounded-full blur-3xl" />

        {/* Subtle grid pattern for modern tech backdrop */}

        <div

          className="absolute inset-0 opacity-[0.03]"

          style={{

            backgroundImage:

              'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',

            backgroundSize: '24px 24px',

          }}

        />

      </div>



      {/* Top Header Overlay Bar */}

      <div className="relative z-20 flex items-center justify-between p-3.5">

        {/* Interviewer Name Label */}

        <div className="flex items-center gap-2 bg-slate-900/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/80 shadow-sm">

          <div className="w-5 h-5 rounded-lg bg-[#4F46E5] flex items-center justify-center text-white">

            <Bot className="w-3.5 h-3.5" />

          </div>

          <div className="flex flex-col">

            <span className="text-xs font-bold text-white tracking-tight leading-none">

              Mock2Real AI Interviewer

            </span>

            <span className="text-[10px] text-indigo-300/80 font-mono leading-tight mt-0.5">

              Technical Evaluator

            </span>

          </div>

        </div>



        {/* Dynamic Speaking / Idle State Indicator */}

        <div className="flex items-center gap-1.5">

          {isSpeaking ? (

            <div className="flex items-center gap-2 bg-indigo-950/90 border border-indigo-500/60 backdrop-blur-md px-2.5 py-1 rounded-lg shadow-md animate-pulse">

              <span className="relative flex h-2 w-2">

                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />

                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500" />

              </span>

              <span className="text-[11px] font-semibold text-indigo-200">

                Speaking Question...

              </span>

              {/* Animated frequency equalizer bars */}

              <div className="flex items-end gap-0.5 h-3 w-4">

                <span className="w-1 bg-indigo-400 rounded-full animate-[bounce_0.6s_infinite_100ms] h-3" />

                <span className="w-1 bg-indigo-400 rounded-full animate-[bounce_0.6s_infinite_200ms] h-2" />

                <span className="w-1 bg-indigo-400 rounded-full animate-[bounce_0.6s_infinite_300ms] h-3.5" />

              </div>

            </div>

          ) : isCandidateAnswering ? (

            <div className="flex items-center gap-1.5 bg-rose-950/70 border border-rose-800/80 backdrop-blur-md px-2.5 py-1 rounded-lg text-rose-300 text-[11px] font-medium">

              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />

              <span>Listening to Answer...</span>

            </div>

          ) : (

            <div className="flex items-center gap-1.5 bg-slate-900/80 border border-slate-700/80 backdrop-blur-md px-2.5 py-1 rounded-lg text-slate-300 text-[11px] font-medium">

              <span className="w-2 h-2 rounded-full bg-emerald-400" />

              <span>Ready</span>

            </div>

          )}

        </div>

      </div>



      {/* Main Center Stage: Professional Friendly AI Avatar */}

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-2">

        <div className="relative flex items-center justify-center">

          {/* Speaking Audio Waves Glowing Ring Effect */}

          {isSpeaking && (

            <>

              <div className="absolute inset-0 rounded-full bg-indigo-500/20 animate-ping scale-125 duration-1000" />

              <div className="absolute inset-0 rounded-full border-2 border-indigo-400/40 animate-pulse scale-110" />

            </>

          )}



          {/* Avatar Graphic Container */}

          <div

            className={`relative w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-tr from-slate-800 via-indigo-950 to-slate-800 p-1 shadow-2xl transition-transform duration-300 ${

              isSpeaking ? 'scale-105 ring-4 ring-indigo-500/40' : 'hover:scale-102'

            }`}

          >

            {/* High-Fidelity Professional Friendly Avatar Illustration */}

            <div className="w-full h-full rounded-full overflow-hidden bg-slate-900 relative flex items-center justify-center border border-slate-700/80">

              <svg

                viewBox="0 0 120 120"

                className="w-full h-full object-cover"

                fill="none"

                xmlns="http\://www.w3.org/2000/svg"

              >

                {/* Background gradient inside avatar */}

                <circle cx="60" cy="60" r="60" fill="url(#avatar_bg)" />



                {/* Corporate Suit / Blazer */}

                <path

                  d="M18 120C18 95 35 84 60 84C85 84 102 95 102 120H18Z"

                  fill="#1E293B"

                />

                {/* Shirt Collar */}

                <path

                  d="M48 84L60 98L72 84L66 120H54L48 84Z"

                  fill="#F8FAFC"

                />

                {/* Tie / Accent Lapel in Mock2Real Indigo */}

                <path

                  d="M57 96L60 118L63 96L60 94L57 96Z"

                  fill="#4F46E5"

                />



                {/* Neck */}

                <path

                  d="M52 70V86C52 87 68 87 68 86V70H52Z"

                  fill="#E2B191"

                />



                {/* Head & Face */}

                <ellipse

                  cx="60"

                  cy="54"

                  rx="22"

                  ry="25"

                  fill="#F0C6A7"

                />



                {/* Friendly Smile */}

                <path

                  d={

                    isSpeaking

                      ? 'M53 65C55 70 65 70 67 65C65 67 55 67 53 65Z'

                      : 'M53 64C56 68 64 68 67 64'

                  }

                  stroke="#8B4513"

                  strokeWidth="2"

                  strokeLinecap="round"

                  fill={isSpeaking ? '#B91C1C' : 'none'}

                />



                {/* Warm, Attentive Eyes */}

                <ellipse cx="51" cy="50" rx="2.5" ry="3" fill="#1E293B" />

                <ellipse cx="69" cy="50" rx="2.5" ry="3" fill="#1E293B" />

                {/* Eye reflections */}

                <circle cx="52" cy="49" r="0.8" fill="#FFFFFF" />

                <circle cx="70" cy="49" r="0.8" fill="#FFFFFF" />



                {/* Eyebrows */}

                <path

                  d="M47 43C50 41 54 42 55 44"

                  stroke="#334155"

                  strokeWidth="1.8"

                  strokeLinecap="round"

                />

                <path

                  d="M65 44C66 42 70 41 73 43"

                  stroke="#334155"

                  strokeWidth="1.8"

                  strokeLinecap="round"

                />



                {/* Professional Hair */}

                <path

                  d="M38 48C36 34 45 23 60 23C75 23 84 34 82 48C79 38 72 32 60 32C48 32 41 38 38 48Z"

                  fill="#1E293B"

                />



                {/* Professional Earpiece / Interview Headset */}

                <circle cx="38" cy="54" r="3.5" fill="#4F46E5" />

                <path

                  d="M38 56C42 63 46 64 50 63"

                  stroke="#4F46E5"

                  strokeWidth="1.8"

                  strokeLinecap="round"

                />



                <defs>

                  <linearGradient

                    id="avatar_bg"

                    x1="60"

                    y1="0"

                    x2="60"

                    y2="120"

                    gradientUnits="userSpaceOnUse"

                  >

                    <stop stopColor="#312E81" />

                    <stop offset="1" stopColor="#0F172A" />

                  </linearGradient>

                </defs>

              </svg>

            </div>



            {/* Speaking active badge indicator on avatar */}

            <div

              className={`absolute bottom-0 right-0 w-6 h-6 rounded-full flex items-center justify-center border-2 border-slate-900 shadow-md ${

                isSpeaking

                  ? 'bg-[#4F46E5] text-white animate-pulse'

                  : 'bg-emerald-500 text-white'

              }`}

              title={isSpeaking ? 'Speaking' : 'Listening'}

            >

              {isSpeaking ? (

                <Volume2 className="w-3.5 h-3.5" />

              ) : (

                <CheckCircle2 className="w-3.5 h-3.5" />

              )}

            </div>

          </div>

        </div>



        {/* Dynamic Context Label */}

        <div className="mt-2 text-center">

          <p className="text-xs font-semibold text-slate-200">

            {isSpeaking

              ? 'Reading question prompt aloud (0.9x speed, 100% volume)...'

              : 'Ready for your response'}

          </p>

          <span className="text-[11px] text-slate-400 font-mono mt-0.5 block">

            {questionCategory}

          </span>

        </div>

      </div>



      {/* Bottom Floating Control Bar with Volume Slider & Replay Button */}

      <div className="relative z-20 flex flex-wrap items-center justify-between gap-2 p-3 border-t border-slate-800/60 bg-slate-950/75 backdrop-blur-md">

        {/* Playback Action Buttons */}

        <div className="flex items-center gap-2">

          {/* Read / Pause Voice Toggle */}

          <button

            type="button"

            onClick={onToggleSpeak}

            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${

              isSpeaking

                ? 'bg-rose-950/80 text-rose-300 border border-rose-800/80 hover:bg-rose-900'

                : 'bg-[#4F46E5] hover:bg-indigo-500 text-white shadow-xs'

            }`}

            title={isSpeaking ? 'Pause AI voice' : 'Listen to AI interviewer speak the question'}

          >

            {isSpeaking ? (

              <>

                <VolumeX className="w-3.5 h-3.5" />

                <span>Pause</span>

              </>

            ) : (

              <>

                <Volume2 className="w-3.5 h-3.5" />

                <span>Read Question</span>

              </>

            )}

          </button>



          {/* Replay Question Button as per Requirement 7 */}

          <button

            type="button"

            onClick={onReplaySpeak}

            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700 transition-colors cursor-pointer"

            title="Replay question from the beginning at 100% volume"

          >

            <RotateCcw className="w-3.5 h-3.5 text-indigo-400" />

            <span className="hidden xs:inline">Replay</span>

          </button>

        </div>



        {/* Visible Voice Volume Slider Control as per Requirements 5 & 6 */}

        <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 px-2.5 py-1 rounded-xl">

          <button

            type="button"

            onClick={() => onVolumeChange(speechVolume === 0 ? 1.0 : 0)}

            className="text-slate-400 hover:text-white transition-colors cursor-pointer"

            title={speechVolume === 0 ? 'Unmute voice' : 'Mute voice'}

          >

            {getVolumeIcon()}

          </button>



          <div className="flex items-center gap-1.5">

            <input

              type="range"

              min="0"

              max="1"

              step="0.05"

              value={speechVolume}

              onChange={(e) => onVolumeChange(parseFloat(e.target.value))}

              aria-label="AI Voice Volume Slider"

              className="w-14 sm:w-16 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#4F46E5]"

            />

            <span className="text-[10px] font-mono text-slate-300 min-w-[28px] text-right font-medium">

              {volumePercentage}%

            </span>

          </div>

        </div>

      </div>

    </div>

  );

};
