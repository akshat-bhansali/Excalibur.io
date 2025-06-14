import React, { useState } from "react";

export default function CharacterSetup() {
  const [cc, setCc] = useState(50);
  const [gc, setGc] = useState(50);

  return (
    <div className="min-h-screen flex flex-col relative bg-gradient-to-b from-white via-gray-50 to-gray-100 p-6">
      {/* Top Center - Name and Hero */}
      <div className="flex flex-col items-center mt-4">
        {/* Name */}
        <div className="text-center mb-4">
          <label className="text-gray-600 font-medium mb-2 block uppercase tracking-wide">
            Name
          </label>
          <input
            type="text"
            placeholder="Enter your hero name"
            className="w-64 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 transition"
          />
        </div>

        {/* Hero Preview */}
        <div
          className="relative p-6 bg-gradient-to-tr rounded-xl shadow-2xl mb-4"
          style={{ backgroundColor: `hsl(${cc * 3.6}, 40%, 90%)` }}
        >
          <div
            className="w-40 h-80 rounded-lg shadow-inner flex items-center justify-center"
            style={{ backgroundColor: `hsl(${cc * 3.6}, 40%, 60%)` }}
          >
            <span className="text-white font-bold text-lg uppercase tracking-wider">
              Hero
            </span>
          </div>
        </div>

        {/* Hero Color Slider */}
        <div className="w-full max-w-sm mb-6">
          <label className="block text-gray-700 font-medium text-center mb-1">
            Character Color
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={cc}
            onChange={(e) => setCc(+e.target.value)}
            className="w-full h-2 rounded-full accent-indigo-500 cursor-pointer transition"
          />
        </div>
      </div>

      {/* Token & League - Left Middle */}
      <div className="absolute left-6 top-1/2 transform -translate-y-1/2 flex flex-col space-y-4">
        <div className="bg-gray-100 rounded-lg px-5 py-3 shadow-inner text-gray-700 font-semibold">
          TOKEN: <span className="text-blue-500">0</span>
        </div>
        <div className="bg-gray-100 rounded-lg px-5 py-3 shadow-inner text-gray-700 font-semibold">
          LEAGUE: <span className="text-indigo-500">Rookie</span>
          <span className="ml-2 text-gray-500">XP: 0/100</span>
        </div>
      </div>

      {/* Gun & Slider - Right Middle */}
      <div className="absolute right-6 top-1/2 transform -translate-y-1/2 flex flex-col items-center space-y-6">
        <div
          className="relative p-6 bg-gradient-to-tr rounded-xl shadow-2xl flex flex-col items-center"
          style={{ backgroundColor: `hsl(${gc * 3.6}, 40%, 90%)` }}
        >
          <div
            className="w-48 h-24 rounded-lg shadow-inner flex items-center justify-center"
            style={{ backgroundColor: `hsl(${gc * 3.6}, 40%, 40%)` }}
          >
            <span className="text-white font-semibold uppercase tracking-wide">
              Rifle
            </span>
          </div>
        </div>
        <div className="w-full max-w-sm">
          <label className="block text-gray-700 font-medium text-center mb-1">
            Gun Color
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={gc}
            onChange={(e) => setGc(+e.target.value)}
            className="w-full h-2 rounded-full accent-pink-500 cursor-pointer transition"
          />
        </div>
      </div>

      {/* Bottom Right - Play Button */}
      <div className="absolute bottom-6 right-6">
        <button className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-bold uppercase tracking-wide py-3 px-12 rounded-full shadow-lg transform hover:scale-105 transition">
          Play
        </button>
      </div>
    </div>
  );
}
