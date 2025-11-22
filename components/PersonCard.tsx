import React, { useState } from 'react';
import { PersonProfile } from '../types';
import { VerdictBadge } from './VerdictBadge';

interface PersonCardProps {
  profile: PersonProfile;
}

const TwitterIcon = () => (
  <svg fill="currentColor" viewBox="0 0 24 24" className="w-4 h-4">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const LinkedInIcon = () => (
  <svg fill="currentColor" viewBox="0 0 24 24" className="w-4 h-4">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

const TelegramIcon = () => (
  <svg fill="currentColor" viewBox="0 0 24 24" className="w-4 h-4">
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
  </svg>
);

const FarcasterIcon = () => (
  <svg fill="currentColor" viewBox="0 0 24 24" className="w-4 h-4">
     <path d="M3.75 4.5C3.75 4.08579 4.08579 3.75 4.5 3.75H19.5C19.9142 3.75 20.25 4.08579 20.25 4.5V19.5C20.25 19.9142 19.9142 20.25 19.5 20.25H4.5C4.08579 20.25 3.75 19.9142 3.75 19.5V4.5Z"/>
     <path fill="black" d="M8.25 15.75H15.75" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
     <path fill="black" d="M12 12V15.75" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
     <path fill="black" d="M12 8.25V9.75" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const SocialLink = ({ url, icon, label }: { url: string; icon: React.ReactNode; label: string }) => (
  <a 
    href={url} 
    target="_blank" 
    rel="noopener noreferrer"
    className="text-gray-500 hover:text-white hover:bg-gray-800 transition-all p-1.5 rounded flex items-center justify-center border border-transparent hover:border-gray-700"
    title={label}
  >
    {icon}
  </a>
);

export const PersonCard: React.FC<PersonCardProps> = ({ profile }) => {
  const [expanded, setExpanded] = useState(false);
  const [imgError, setImgError] = useState(false);

  // Fallback avatar
  const fallbackUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=111&color=fff&size=128&bold=true`;
  
  // Determine which image to use
  const imageUrl = !imgError && profile.imageUrl ? profile.imageUrl : fallbackUrl;
  
  // Check if it's AI generated (starts with data:image)
  const isAiGenerated = profile.imageUrl && profile.imageUrl.startsWith('data:image');

  const getBarColor = (score: number) => {
    if (score < 4) return 'bg-green-500';
    if (score < 7) return 'bg-yellow-500';
    if (score < 9) return 'bg-red-500';
    return 'bg-neon-purple';
  };

  return (
    <div className="bg-card-bg border border-gray-800 rounded-lg overflow-hidden hover:border-gray-600 transition-all duration-300 relative group h-full flex flex-col">
      {/* Top Decorator */}
      <div className="h-1 w-full bg-gradient-to-r from-transparent via-gray-700 to-transparent opacity-50"></div>
      
      <div className="p-6 flex-1 flex flex-col">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4 w-full">
            <div className="relative w-20 h-20 rounded-lg overflow-hidden border-2 border-gray-700 group-hover:border-white transition-colors shrink-0 bg-black">
              <img 
                src={imageUrl} 
                alt={profile.name} 
                className="w-full h-full object-cover"
                onError={() => setImgError(true)}
              />
              {/* Overlay for high cult score */}
              {profile.cultScore > 8 && (
                <div className="absolute inset-0 bg-neon-purple/20 mix-blend-overlay"></div>
              )}
              
              {/* Source Indicator */}
              <div className="absolute bottom-0 left-0 right-0 bg-black/80 text-[0.6rem] text-center py-0.5 text-gray-400 uppercase font-mono tracking-wider">
                {isAiGenerated ? 'AI RECON' : (imgError || !profile.imageUrl ? 'NO DATA' : 'NET IMG')}
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-xl font-bold text-white tracking-wide font-mono truncate">{profile.name}</h3>
              <p className="text-xs text-gray-400 font-mono uppercase tracking-wider line-clamp-2 mb-2">{profile.role}</p>
              
              {/* Social Icons */}
              {profile.socials && (
                <div className="flex items-center gap-1">
                    {profile.socials.twitter && <SocialLink url={profile.socials.twitter} icon={<TwitterIcon />} label="Twitter/X" />}
                    {profile.socials.linkedin && <SocialLink url={profile.socials.linkedin} icon={<LinkedInIcon />} label="LinkedIn" />}
                    {profile.socials.telegram && <SocialLink url={profile.socials.telegram} icon={<TelegramIcon />} label="Telegram" />}
                    {profile.socials.farcaster && <SocialLink url={profile.socials.farcaster} icon={<FarcasterIcon />} label="Farcaster" />}
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="mb-6 flex justify-end">
            <VerdictBadge verdict={profile.verdict} />
        </div>

        {/* Cult Meter */}
        <div className="mb-6">
            <div className="flex justify-between text-xs font-mono text-gray-500 mb-1">
                <span>NORMAL</span>
                <span>INFLUENCER</span>
                <span>DEITY</span>
            </div>
            <div className="h-2 w-full bg-gray-900 rounded-full overflow-hidden relative">
                <div 
                    className={`h-full ${getBarColor(profile.cultScore)} transition-all duration-1000 ease-out`} 
                    style={{ width: `${profile.cultScore * 10}%` }}
                ></div>
                {/* Tick marks */}
                <div className="absolute top-0 left-1/3 w-px h-full bg-black/50"></div>
                <div className="absolute top-0 left-2/3 w-px h-full bg-black/50"></div>
            </div>
            <p className="text-right text-xs text-gray-400 mt-1 font-mono">
                CULT_SCORE: <span className="text-white">{profile.cultScore}/10</span>
            </p>
        </div>

        <div className="space-y-4 flex-1">
            <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1 border-b border-gray-800 pb-1">Diagnosis</h4>
                <p className="text-sm text-gray-300 leading-relaxed">{profile.diagnosis}</p>
            </div>
            
            {expanded && (
                <div className="space-y-4 animate-fadeIn pt-2">
                     <div>
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1 border-b border-gray-800 pb-1">Background Data</h4>
                        <p className="text-sm text-gray-400">{profile.background}</p>
                    </div>
                    {profile.conspiracies && (
                        <div className="bg-red-900/10 p-3 border-l-2 border-red-900 rounded-r">
                             <h4 className="text-xs font-bold text-red-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
                                Detected Red Flags
                             </h4>
                             <p className="text-sm text-gray-300 italic">{profile.conspiracies}</p>
                        </div>
                    )}
                </div>
            )}
        </div>

        <button 
            onClick={() => setExpanded(!expanded)}
            className="w-full mt-6 py-2 bg-gray-900 hover:bg-gray-800 text-xs text-gray-400 uppercase tracking-widest font-bold rounded transition-colors border border-transparent hover:border-gray-700"
        >
            {expanded ? 'Collapse Data' : 'Access Full Dossier'}
        </button>
      </div>
    </div>
  );
};