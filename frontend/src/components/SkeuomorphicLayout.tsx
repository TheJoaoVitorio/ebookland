import React from 'react';

export function SkeuomorphicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="ipad-wrapper">
      <div className="leather-cover"></div>
      <div className="device-bezel">
        <div className="device-screen">
          {children}
        </div>
        <div className="pencil">
          <div className="pencil-eraser"></div>
          <div className="pencil-tip"></div>
          <div className="pencil-lead"></div>
        </div>
      </div>
    </div>
  );
}
