import React from 'react';
import { ShieldCheck, Link, Clock, FileCheck } from 'lucide-react';

const FeaturesBar = () => {
  const features = [
    { icon: <ShieldCheck size={20} className="text-gray-400" />, text: "No investment advice" },
    { icon: <Link size={20} className="text-gray-400" />, text: "Every answer cited" },
    { icon: <Clock size={20} className="text-gray-400" />, text: "Updated daily at 9:15 AM" },
    { icon: <FileCheck size={20} className="text-gray-400" />, text: "Official sources only" },
  ];

  return (
    <section className="border-t border-b border-gray-100 py-6">
      <div className="max-w-5xl mx-auto flex flex-wrap justify-between gap-8 px-6">
        {features.map((f, i) => (
          <div key={i} className="flex items-center gap-2.5">
            {f.icon}
            <span className="text-[14px] text-gray-500 font-medium">{f.text}</span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FeaturesBar;
