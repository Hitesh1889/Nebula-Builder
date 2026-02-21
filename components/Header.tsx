import React from 'react';
import { APP_NAME } from '../constants';
import { clearApiKey } from '../services/aiService';

interface HeaderProps {
  onGoHome?: () => void;
  onChangeKey?: () => void;
}

// Lightweight header — mostly replaced by inline nav in App.tsx
const Header: React.FC<HeaderProps> = ({ onGoHome, onChangeKey }) => {
  return (
    <header style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 24px',height:52,background:'rgba(6,6,15,0.95)',borderBottom:'1px solid rgba(255,255,255,0.06)'}}>
      <div style={{display:'flex',alignItems:'center',gap:10,cursor:'pointer'}} onClick={onGoHome}>
        <svg width={22} height={22} viewBox="0 0 32 32" fill="none">
          <path d="M6 5V27" stroke="#f97316" strokeWidth="5" strokeLinecap="round"/>
          <path d="M26 5V27" stroke="#10b981" strokeWidth="5" strokeLinecap="round"/>
          <path d="M6 27L26 5" stroke="#ef4444" strokeWidth="5" strokeLinecap="round"/>
        </svg>
        <span style={{fontWeight:700,fontSize:15,color:'white',letterSpacing:'-0.2px'}}>{APP_NAME}</span>
      </div>
      {onChangeKey && (
        <button onClick={()=>{clearApiKey();onChangeKey();}}
          style={{padding:'5px 12px',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:8,color:'#64748b',fontSize:12,cursor:'pointer'}}>
          API Keys
        </button>
      )}
    </header>
  );
};

export default Header;
