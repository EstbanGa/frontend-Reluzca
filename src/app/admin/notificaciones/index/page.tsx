"use client";

import { withAdminRole } from "@/hoc/withRole";
import { Calendar, Wrench, Sparkles } from "lucide-react";

function TempPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Icon Container */}
        <div className="relative mb-8">
          <div className="w-24 h-24 mx-auto bg-gradient-to-br from-[#4894AD] to-[#D95B26] rounded-2xl flex items-center justify-center shadow-lg">
            <Calendar className="h-10 w-10 text-white" />
          </div>
          
          {/* Decorative elements */}
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
            <Sparkles className="h-3 w-3 text-yellow-800" />
          </div>
          <div className="absolute -bottom-1 -left-2 w-5 h-5 bg-green-400 rounded-full opacity-80"></div>
        </div>

        {/* Main Content */}
        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-gray-900">
            ¡Estamos trabajando! 
          </h1>
          
          <p className="text-lg text-gray-600 leading-relaxed">
            Esta sección estará disponible muy pronto
          </p>
          
          <p className="text-sm text-gray-500">
            Estamos preparando una experiencia increíble para ti
          </p>
        </div>

        {/* Loading Animation */}
        <div className="mt-8">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-[#4894AD] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-[#D95B26] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-[#4894AD] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-6">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-[#4894AD] to-[#D95B26] h-2 rounded-full transition-all duration-1000 ease-out"
              style={{ width: '75%' }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 mt-2">75% completado</p>
        </div>

        {/* Tool Icon */}
        <div className="mt-8 opacity-20">
          <Wrench className="h-16 w-16 text-[#4894AD] mx-auto animate-pulse" />
        </div>
      </div>
    </div>
  );
}

export default withAdminRole(TempPage);