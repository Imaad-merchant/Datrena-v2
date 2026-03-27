import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import MainNav from "../components/navigation/MainNav";
import { 
  Plus, FolderOpen, ArrowRight, Building2, BookOpen, 
  Database, BarChart2, Radio, HeadphonesIcon, Trash2, Play
} from "lucide-react";

const SECTIONS = [
  { name: "Organization", icon: Building2, page: "Organization", description: "Manage your workspace, team settings, and account preferences." },
  { name: "Learning", icon: BookOpen, page: "Learning", description: "Access courses, tutorials, and quant trading resources." },
  { name: "Datasets", icon: Database, page: "Datasets", description: "Browse and manage your imported market datasets." },
  { name: "Strategies", icon: BarChart2, page: "Strategies", description: "Build, manage, and deploy trading strategies." },
  { name: "Live", icon: Radio, page: "Live", description: "Monitor live trading sessions and real-time performance." },
  { name: "Support", icon: HeadphonesIcon, page: "Support", description: "Get help, submit tickets, and access documentation." },
];

const INITIAL_PROJECTS = [
  { id: 1, name: "ES Volatility Study", section: "Strategies", lastOpened: "2 hours ago" },
  { id: 2, name: "NQ Footprint Analysis", section: "Datasets", lastOpened: "Yesterday" },
  { id: 3, name: "Trend Breakout System", section: "Strategies", lastOpened: "3 days ago" },
];

export default function ValidationLayer() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState(INITIAL_PROJECTS);

  const deleteProject = (id) => setProjects(prev => prev.filter(p => p.id !== id));

  return (
    <div className="min-h-screen bg-black pl-16 text-white">
      <MainNav />

      <div className="max-w-6xl mx-auto px-8 py-10 grid grid-cols-3 gap-8">

        {/* Left Column */}
        <div className="col-span-1 space-y-8">
          {/* Start */}
          <div>
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">Start</h2>
            <div className="space-y-3">
              <button className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors">
                <Plus className="w-4 h-4" />
                New Project
              </button>
              <button className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors">
                <FolderOpen className="w-4 h-4" />
                Open Project
              </button>
            </div>
          </div>

          {/* Nav */}
          <div>
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">Navigation</h2>
            <div className="space-y-1">
              {SECTIONS.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.name}
                    onClick={() => navigate(createPageUrl(section.page))}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-900 transition-all text-left group"
                  >
                    <Icon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="text-sm text-gray-300 group-hover:text-white transition-colors">{section.name}</span>
                    <ArrowRight className="w-3 h-3 text-gray-700 group-hover:text-gray-400 ml-auto transition-colors" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Recent Projects */}
          <div>
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">Recent Projects</h2>
            <div className="space-y-2">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="flex items-center gap-2 group px-2 py-1.5 rounded-lg hover:bg-gray-900 transition-all"
                >
                  <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-300 truncate">{project.name}</p>
                    <p className="text-xs text-gray-600">{project.lastOpened}</p>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button title="Resume" className="p-1 hover:text-green-400 text-gray-600 transition-colors">
                      <Play className="w-3 h-3" />
                    </button>
                    <button title="Delete" onClick={() => deleteProject(project.id)} className="p-1 hover:text-red-400 text-gray-600 transition-colors">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Section Cards */}
        <div className="col-span-2">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-6">Overview</h2>
          <div className="grid grid-cols-2 gap-4">
            {SECTIONS.map((section) => {
              const Icon = section.icon;
              return (
                <div
                  key={section.name}
                  onClick={() => navigate(createPageUrl(section.page))}
                  className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-600 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center">
                      <Icon className="w-4 h-4 text-gray-300" />
                    </div>
                    <h3 className="text-sm font-semibold text-white">{section.name}</h3>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">{section.description}</p>
                  <div className="mt-3 flex items-center gap-1 text-xs text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    Open <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}