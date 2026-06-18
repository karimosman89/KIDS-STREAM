import React from 'react';
import { CustomAvatarConfig } from '../types';

interface CustomAvatarRendererProps {
  config?: CustomAvatarConfig;
  className?: string;
}

export const CustomAvatarRenderer: React.FC<CustomAvatarRendererProps> = ({ config, className = 'w-10 h-10' }) => {
  if (!config) {
    // Return fallback layout or blank
    return null;
  }

  const { bodyType, color, eyes, mouth, accessory } = config;

  // Let's define the base body shape SVGs with 100x100 coordenate bounds
  const renderBody = () => {
    switch (bodyType) {
      case 'blob':
        return (
          <path
            d="M 20 45 C 20 20, 80 20, 80 45 C 80 75, 20 75, 20 45 Z"
            fill={color}
            className="transition-all duration-300 transform origin-center"
          />
        );
      case 'box':
        return (
          <rect
            x="22"
            y="26"
            width="56"
            height="50"
            rx="14"
            fill={color}
            className="transition-all duration-300"
          />
        );
      case 'bunny':
        return (
          <g className="transition-all duration-300">
            {/* Bunny Ears */}
            <ellipse cx="36" cy="20" rx="6" ry="16" fill={color} transform="rotate(-15 36 20)" />
            <ellipse cx="36" cy="20" rx="3" ry="11" fill="#FF80BF" transform="rotate(-15 36 20)" />
            
            <ellipse cx="64" cy="20" rx="6" ry="16" fill={color} transform="rotate(15 64 20)" />
            <ellipse cx="64" cy="20" rx="3" ry="11" fill="#FF80BF" transform="rotate(15 64 20)" />
            
            {/* Head */}
            <circle cx="50" cy="52" r="28" fill={color} />
          </g>
        );
      case 'cat':
        return (
          <g className="transition-all duration-300">
            {/* Cat Ears */}
            <polygon points="22,34 36,15 44,38" fill={color} />
            <polygon points="26,33 34,20 39,34" fill="#FF99C8" />
            
            <polygon points="78,34 64,15 56,38" fill={color} />
            <polygon points="74,33 66,20 61,34" fill="#FF99C8" />
            
            {/* Head */}
            <circle cx="50" cy="52" r="28" fill={color} />
          </g>
        );
      case 'star':
        return (
          <path
            d="M 50 12 L 61 36 L 88 38 L 68 56 L 74 84 L 50 69 L 26 84 L 32 56 L 12 38 L 39 36 Z"
            fill={color}
            className="transition-all duration-300 transform origin-center"
          />
        );
      default:
        return <circle cx="50" cy="50" r="30" fill={color} />;
    }
  };

  const renderEyes = () => {
    switch (eyes) {
      case 'sparkle':
        return (
          <g>
            {/* Left Eye */}
            <circle cx="38" cy="48" r="6" fill="#000" />
            <circle cx="36" cy="46" r="2" fill="#fff" />
            <circle cx="40" cy="50" r="1" fill="#fff" />
            {/* Right Eye */}
            <circle cx="62" cy="48" r="6" fill="#000" />
            <circle cx="60" cy="46" r="2" fill="#fff" />
            <circle cx="64" cy="50" r="1" fill="#fff" />
          </g>
        );
      case 'cool':
        return (
          <g>
            {/* Cool Sunglasses */}
            <path d="M 28 44 L 72 44 L 68 54 Q 60 56 52 48 Q 44 56 32 54 Z" fill="#111" />
            <line x1="30" y1="46" x2="42" y2="52" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
            <line x1="58" y1="46" x2="68" y2="52" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
          </g>
        );
      case 'wink':
        return (
          <g>
            {/* Left Eye - Normal Sparkle */}
            <circle cx="38" cy="48" r="6" fill="#000" />
            <circle cx="36" cy="46" r="2" fill="#fff" />
            {/* Right Eye - Cute Winking Arch */}
            <path d="M 56 48 Q 62 42 68 48" stroke="#000" strokeWidth="3" fill="none" strokeLinecap="round" />
          </g>
        );
      case 'joy':
        return (
          <g>
            {/* Happy anime closed eyes */}
            <path d="M 30 50 Q 38 43 44 50" stroke="#000" strokeWidth="3" fill="none" strokeLinecap="round" />
            <path d="M 56 50 Q 62 43 70 50" stroke="#000" strokeWidth="3" fill="none" strokeLinecap="round" />
          </g>
        );
      case 'glasses':
        return (
          <g>
            {/* Eye Dots */}
            <circle cx="38" cy="48" r="3" fill="#000" />
            <circle cx="62" cy="48" r="3" fill="#000" />
            {/* Round Glasses frames */}
            <circle cx="38" cy="48" r="8" stroke="#FF007F" strokeWidth="3" fill="none" />
            <circle cx="62" cy="48" r="8" stroke="#FF007F" strokeWidth="3" fill="none" />
            {/* Bridge */}
            <path d="M 46 48 Q 50 46 54 48" stroke="#FF007F" strokeWidth="3" fill="none" />
          </g>
        );
      default:
        return null;
    }
  };

  const renderMouth = () => {
    switch (mouth) {
      case 'smile':
        return (
          <path d="M 42 58 Q 50 66 58 58" stroke="#000" strokeWidth="3.5" fill="none" strokeLinecap="round" />
        );
      case 'tongue':
        return (
          <g>
            <path d="M 44 58 Q 50 63 56 58" stroke="#000" strokeWidth="3" fill="none" strokeLinecap="round" />
            {/* Pink tongue sticking out */}
            <path d="M 46 59 Q 50 71 54 59 Z" fill="#FF4D4D" />
          </g>
        );
      case 'whiskers':
        return (
          <g>
            {/* Whiskers */}
            <line x1="24" y1="56" x2="16" y2="54" stroke="#000" strokeWidth="2" strokeLinecap="round" />
            <line x1="24" y1="60" x2="14" y2="61" stroke="#000" strokeWidth="2" strokeLinecap="round" />
            
            <line x1="76" y1="56" x2="84" y2="54" stroke="#000" strokeWidth="2" strokeLinecap="round" />
            <line x1="76" y1="60" x2="86" y2="61" stroke="#000" strokeWidth="2" strokeLinecap="round" />
            {/* Cat mouth */}
            <path d="M 44 58 Q 47 61 50 58 Q 53 61 56 58" stroke="#000" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          </g>
        );
      case 'vamp':
        return (
          <g>
            {/* Smiling lips with cute fangs */}
            <path d="M 42 58 Q 50 65 58 58" stroke="#000" strokeWidth="3.5" fill="none" strokeLinecap="round" />
            <polygon points="44,58 46,58 45,63" fill="#fff" stroke="#000" strokeWidth="1" />
            <polygon points="54,58 56,58 55,63" fill="#fff" stroke="#000" strokeWidth="1" />
          </g>
        );
      case 'mustache':
        return (
          <g>
            {/* Classy mustache */}
            <path d="M 50 58 Q 42 54 36 60 Q 42 62 48 59 Z" fill="#4B3621" />
            <path d="M 50 58 Q 58 54 64 60 Q 58 62 52 59 Z" fill="#4B3621" />
            {/* Mouth */}
            <path d="M 47 62 Q 50 65 53 62" stroke="#000" strokeWidth="2" fill="none" strokeLinecap="round" />
          </g>
        );
      default:
        return null;
    }
  };

  const renderAccessory = () => {
    switch (accessory) {
      case 'crown':
        return (
          <g className="animate-pulse">
            {/* Sparkling Gold Crown */}
            <polygon points="32,24 38,12 50,22 62,12 68,24" fill="#FFD700" stroke="#DAA520" strokeWidth="1" />
            {/* Little Jewel Dots */}
            <circle cx="38" cy="12" r="1.5" fill="#FF007F" />
            <circle cx="50" cy="22" r="1.5" fill="#00F2FF" />
            <circle cx="62" cy="12" r="1.5" fill="#FF007F" />
          </g>
        );
      case 'wizard':
        return (
          <g>
            {/* Purple Pointy Hat */}
            <polygon points="20,28 50,0 80,28" fill="#5811A1" />
            {/* Yellow Stars on hat */}
            <polygon points="50,10 52,14 55,14 53,16 54,20 50,18 46,20 47,16 45,14 48,14" fill="#FFE033" />
            <line x1="16" y1="28" x2="84" y2="28" stroke="#5811A1" strokeWidth="4" strokeLinecap="round" />
          </g>
        );
      case 'party':
        return (
          <g>
            {/* Striped Party Cone */}
            <polygon points="34,26 50,6 66,26" fill="#FF0080" />
            {/* Neon stripes */}
            <path d="M 38 21 L 58 13" stroke="#00F2FF" strokeWidth="3.5" />
            <path d="M 43 26 L 62 18" stroke="#FFFF00" strokeWidth="3.5" />
            {/* Yellow puff top pom-pom */}
            <circle cx="50" cy="5" r="3" fill="#FFE033" className="animate-bounce" />
          </g>
        );
      case 'headphones':
        return (
          <g>
            {/* Cyber Gamer Headset band */}
            <path d="M 22 52 Q 22 20 78 52" stroke="#00F2FF" strokeWidth="4" fill="none" />
            {/* Left earphone */}
            <rect x="18" y="44" width="8" height="16" rx="4" fill="#FF0080" />
            <rect x="20" y="47" width="4" height="10" rx="2" fill="#00F2FF animate-pulse" />
            {/* Right earphone */}
            <rect x="74" y="44" width="8" height="16" rx="4" fill="#FF0080" />
            <rect x="76" y="47" width="4" height="10" rx="2" fill="#00F2FF animate-pulse" />
          </g>
        );
      case 'space':
        return (
          <g>
            {/* Translucent astronaut visor bubble */}
            <circle cx="50" cy="50" r="38" stroke="#00F2FF" strokeWidth="2.5" fill="rgba(0, 242, 255, 0.08)" />
            {/* White visor shine reflection */}
            <path d="M 24 34 Q 38 18 56 22" stroke="#fff" strokeWidth="2.5" fill="none" opacity="0.4" strokeLinecap="round" />
            {/* Space base attachment */}
            <rect x="36" y="82" width="28" height="6" rx="3" fill="#fff" stroke="#D1D5DB" strokeWidth="1" />
          </g>
        );
      case 'flower':
        return (
          <g className="animate-[spin_12s_linear_infinite] origin-[68px_30px]">
            {/* Pink daisy on candidate's left ear side */}
            <circle cx="68" cy="30" r="4" fill="#FFE333" />
            {/* Petals */}
            <circle cx="63" cy="27" r="3.5" fill="#FF80DF" />
            <circle cx="73" cy="27" r="3.5" fill="#FF80DF" />
            <circle cx="63" cy="33" r="3.5" fill="#FF80DF" />
            <circle cx="73" cy="33" r="3.5" fill="#FF80DF" />
            <circle cx="68" cy="24" r="3.5" fill="#FF80DF" />
            <circle cx="68" cy="36" r="3.5" fill="#FF80DF" />
          </g>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`relative flex items-center justify-center ${className} select-none`}>
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-lg"
      >
        {/* Background ambient container circular glow inside limits */}
        <circle cx="50" cy="50" r="45" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.06)" strokeWidth="1.5" />
        
        {/* Render base customized character body */}
        {renderBody()}

        {/* Eyes layers */}
        {renderEyes()}

        {/* Mouth/Expression layer */}
        {renderMouth()}

        {/* Accessory layer */}
        {renderAccessory()}
      </svg>
    </div>
  );
};
