import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DollarOutlined } from "@ant-design/icons";
import { mintXToken, updateXp } from "../contracts/function";
import { useAccount } from "wagmi";

const RANKS = ["private", "corporal", "sergeant", "major"];
const XP_PHASE_DURATION = 1000;
const XP_PHASE_DELAY = 100;
const TOKEN_ANIM_DURATION = 1000;

export const XpChangeScreen = ({ kill, death, xp, token, onBack }) => {
  const oldXP = Number(xp);
  const deltaXP = Number(kill) * 10 - Number(death) * 3;
  const totalXP = oldXP + deltaXP;

  const oldProg = ((oldXP % 100) + 100) % 100;
  const finalProg = (((oldProg + deltaXP) % 100) + 100) % 100;
  const wrapCount = Math.floor((oldProg + deltaXP) / 100);

  const initialRankIdx = Math.min(Math.floor(oldXP / 100), RANKS.length - 1);

  const oldTokens = Number(token);
  const newTokens = oldTokens + Math.max(deltaXP, 0);

  const [displayRank, setDisplayRank] = useState(RANKS[initialRankIdx]);
  const [bar, setBar] = useState(oldProg);
  const [displayedTokens, setDisplayedTokens] = useState(oldTokens);
  const account = useAccount()

  useEffect(() => {
    if (wrapCount > 0) {
      setTimeout(() => setBar(100), XP_PHASE_DELAY);

      const t1 = setTimeout(() => {
        const nextIdx = Math.min(initialRankIdx + wrapCount, RANKS.length - 1);
        setDisplayRank(RANKS[nextIdx]);
        setBar(0);
        setTimeout(() => setBar(finalProg), XP_PHASE_DELAY);
      }, XP_PHASE_DURATION + XP_PHASE_DELAY);

      return () => clearTimeout(t1);
    }

    if (wrapCount < 0) {
      setTimeout(() => setBar(0), XP_PHASE_DELAY);

      const t2 = setTimeout(() => {
        const nextIdx = Math.max(initialRankIdx + wrapCount, 0);
        setDisplayRank(RANKS[nextIdx]);
        setBar(100);
        setTimeout(() => setBar(finalProg), XP_PHASE_DELAY);
      }, XP_PHASE_DURATION + XP_PHASE_DELAY);

      return () => clearTimeout(t2);
    }

    setTimeout(() => setBar(finalProg), XP_PHASE_DELAY);
  }, []);

  useEffect(() => {
    const diff = newTokens - oldTokens;
    const steps = Math.abs(diff);
    if (steps === 0) return;

    const stepTime = TOKEN_ANIM_DURATION / steps;
    let current = oldTokens;
    const sign = diff > 0 ? 1 : -1;

    const iv = setInterval(() => {
      current += sign;
      setDisplayedTokens(current);
      if (current === newTokens) clearInterval(iv);
    }, stepTime);

    return () => clearInterval(iv);
  }, []);
  useEffect(()=>{
    updateXp(totalXP).then((res) => {
      console.log("XP updated successfully", res);
    }).catch((err) => {
      console.error("Error updating XP", err);
    });
    mintXToken(account.address,Math.max(deltaXP, 0)*10**18).then((res) => {
      console.log("Tokens minted successfully", res);
    }).catch((err) => {
      console.error("Error minting tokens", err);
    })

  },[])

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
      <div className="relative bg-gray-900 text-white rounded-2xl shadow-xl p-6 max-w-sm w-full m-3">
        <h2 className="text-2xl font-bold mb-4 text-center">Match Summary</h2>

        <div className="flex justify-between text-gray-300 text-sm px-5">
          <p>
            <span className="font-semibold">🔫</span> {kill}
          </p>
          <p>
            <span className="font-semibold">💀</span> {death}
          </p>
          <p className=" space-x-2 text-lg font-semibold text-yellow-300">
            <DollarOutlined className="text-xl" />
            <span>{displayedTokens}</span>
          </p>
        </div>

        <div className="flex items-center space-x-3 ">
          <div className="w-12 h-12 relative">
            <AnimatePresence exitBeforeEnter>
              <motion.img
                key={displayRank}
                src={`/ranks/${displayRank}.png`}
                alt={displayRank}
                className="absolute top-0 left-0 w-12 h-12 rounded-full border-2 border-green-400 p-1"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 20, opacity: 0 }}
                transition={{ duration: 0.4 }}
              />
            </AnimatePresence>
          </div>
          <div className="flex-1 bg-gray-700 h-4 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-green-500"
              animate={{ width: `${bar}%` }}
              transition={{ duration: XP_PHASE_DURATION / 1000 }}
            />
          </div>
          <div className="w-10 text-right text-sm">{bar.toFixed(0)}%</div>
        </div>

        <button
          onClick={onBack}
          className="mt-6 w-full py-2 px-6 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-full shadow-md hover:shadow-lg transition duration-200 ease-in-out"
        >
          Go to Lobby
        </button>
      </div>
    </div>
  );
};
