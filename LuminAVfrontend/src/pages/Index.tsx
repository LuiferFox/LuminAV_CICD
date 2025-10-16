// src/pages/Index.tsx
import React from "react";

const Index: React.FC = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold gradient-energy bg-clip-text text-transparent">
          LuminAV Energy Management
        </h1>
        <p className="text-xl text-muted-foreground">
          Tu panel de gestión energética inteligente está listo
        </p>
      </div>
    </div>
  );
};

export default Index;
