import React, { useState } from "react";
import { CloseOutlined } from "@ant-design/icons";
import { updateName } from "../contracts/function";
import axios from 'axios';
import { toast } from "react-toastify";

export const EditProfile = ({ onBack, address, profileName }) => {
  const [name, setName] = useState(profileName);
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const generateAIName = async () => {
    setLoading(true);
    try {
      const themes = [
        "Generate a single word epic warrior name",
        "Generate a single word mystical wizard name",
        "Generate a single word stealthy assassin name",
        "Generate a single word legendary hero name",
        "Generate a single word mythical creature name"
      ];
      
      const randomTheme = themes[Math.floor(Math.random() * themes.length)];
      
      const response = await axios({
        url: "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyCHK_9m7dwti-kYYWmr-ciR-Kp9_QTgvOc",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        data: {
          contents: [
            {
              parts: [{ 
                text: `${randomTheme}. Make it unique and creative, return just the name without any explanation or punctuation` 
              }],
            },
          ],
        },
      });
      
      const suggestedName = response.data.candidates[0].content.parts[0].text;
      setName(suggestedName.trim());
      
    } catch (error) {
      console.error("Error generating name:", error);
      toast.error("Failed to generate name");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Please enter a name");
      return;
    }

    setIsSaving(true);
    try {
      await updateName(name);
      toast.success("Name updated successfully!");
      onBack();
    } catch (error) {
      console.error("Error updating name:", error);
      toast.error("Failed to update name");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-51">
      <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
        <button
          onClick={onBack}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition"
        >
          <CloseOutlined style={{ fontSize: "20px" }} />
        </button>

        <h2 className="text-3xl font-bold mb-8 text-white text-center">
          Edit Profile Name
        </h2>

        <div className="space-y-6">
          <div className="relative">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-gray-800/50 text-white border border-gray-700 rounded-lg px-4 py-3 
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                text-lg transition-all duration-200"
              placeholder="Enter your name"
            />
            <button
              onClick={generateAIName}
              disabled={loading}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 
                bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md 
                shadow-lg hover:shadow-blue-500/20 transition duration-200 ease-in-out
                disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  Generating
                </span>
              ) : (
                "Generate"
              )}
            </button>
          </div>

          <div className="text-gray-400 text-sm text-center">
            Connected Address: {address?.slice(0, 6)}...{address?.slice(-4)}
          </div>

          <button
            onClick={handleSave}
            disabled={isSaving || !name.trim()}
            className="w-full py-3 px-6 bg-green-600 hover:bg-green-700 
              text-white font-semibold rounded-lg shadow-lg 
              hover:shadow-green-500/20 transition duration-200 ease-in-out
              disabled:opacity-50 disabled:cursor-not-allowed
              transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {isSaving ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                Updating ...
              </span>
            ) : (
              "Update Name"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
