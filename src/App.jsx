import { Loader, PerformanceMonitor, SoftShadows } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import { Physics } from "@react-three/rapier";
import { ToastContainer } from 'react-toastify';
import { Suspense, useState, useCallback } from "react";
import { Experience } from "./components/Experience";
import { Leaderboard } from "./components/Leaderboard";
import { PlayerProfileForm } from "./components/PlayerForm";
import { XpChangeScreen } from "./components/XpChangeScreen";
import { Shop } from "./components/Shop";
import { getXTokenBalance } from "./contracts/function";
import { formatEther } from "viem";
import React from "react";

function App() {
  const [downgradedPerformance, setDowngradedPerformance] = useState(false);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [isXpChange, setIsXpChange] = useState(false);
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [playerData, setPlayerData] = useState(null);
  const [kill, setKill] = useState(0);
  const [death, setDeath] = useState(0);
  const [xp, setXp] = useState(0);

  const handleProfileSubmit = useCallback((data) => {
    setPlayerData(data);
    setIsGameStarted(true);
  }, []);

  const onBack = useCallback(() => {
    setIsXpChange(false);
    setIsGameStarted(false);
  }, []);

  const xpChange = useCallback((killCount, deathCount, xpGained) => {
    setKill(killCount);
    setDeath(deathCount);
    setXp(xpGained);
    setIsXpChange(true);
  }, []);

  const updateBalance = useCallback(async () => {
    if (playerData?.address) {
      try {
        const balance = await getXTokenBalance(playerData.address);
        setPlayerData(prev => ({
          ...prev,
          token: formatEther(balance)
        }));
      } catch (error) {
        console.error("Error updating balance:", error);
      }
    }
  }, [playerData?.address]);

  if (isXpChange) {
    return (
      <>
        <ToastContainer position="top-center" autoClose={3000} />
        <XpChangeScreen
          kill={kill}
          death={death}
          xp={xp}
          token={playerData?.token}
          onBack={onBack}
        />
      </>
    );
  }

  return (
    <div className="h-[1000px]">
      <ToastContainer position="top-center" autoClose={3000} />
      <Loader />
      {isGameStarted && <Leaderboard />}

      {!isGameStarted && playerData?.address && (
        <button
          onClick={() => setIsShopOpen(true)}
          className="fixed right-20 top-4 z-10 bg-blue-600 hover:bg-blue-700 text-white 
            px-4 py-2 rounded-lg shadow-lg transition-all duration-200 font-semibold"
        >
          Shop
        </button>
      )}

      {isShopOpen && (
        <Shop
          onClose={() => setIsShopOpen(false)}
          balance={playerData?.token || "0"}
          updateBalance={updateBalance}
        />
      )}

      {!isGameStarted ? (
        // <PlayerProfileForm onSubmit={handleProfileSubmit} />
        <div>hi</div>
      ) : (
        <Canvas
          shadows
          camera={{ position: [0, 30, 0], fov: 30, near: 2 }}
          dpr={[1, 1.5]}
        >
          <color attach="background" args={["#242424"]} />
          <SoftShadows size={42} />
          <PerformanceMonitor onDecline={() => setDowngradedPerformance(true)} />
          <Suspense>
            <Physics>
              <Experience
                downgradedPerformance={downgradedPerformance}
                playerData={playerData}
                xpChange={xpChange}
              />
            </Physics>
          </Suspense>
          {!downgradedPerformance && (
            <EffectComposer disableNormalPass>
              <Bloom luminanceThreshold={1} intensity={1.5} mipmapBlur />
            </EffectComposer>
          )}
        </Canvas>
      )}
    </div>
  );
}

export default App;
