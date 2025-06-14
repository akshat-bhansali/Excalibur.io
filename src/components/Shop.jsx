import { DollarOutlined, CloseOutlined, LockOutlined, CheckCircleFilled, FireFilled, ThunderboltFilled, ShoppingCartOutlined, CrownOutlined } from "@ant-design/icons";
import Colors from "./Colors.json";
import Stats from "./Stats.json";
import { toast } from "react-toastify";
import { mintWeapon, buySkin, approveXToken } from "../contracts/function";
import { useCallback, useState } from "react";
import { platformAddress } from "../contracts/contracts";
import React from "react";

export const Shop = ({ onClose, balance, updateBalance, playerWeapons, playerSkins }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState('skins');
  const [selectedWeapon, setSelectedWeapon] = useState(Stats[0]);
  const SKIN_PRICE = 20;

  const handleBuyItem = useCallback(async (type, id, price) => {
    if (isProcessing) return;
    try {
      setIsProcessing(true);
      toast.info("Processing transaction...");
      await approveXToken(platformAddress, BigInt(price * 10**18));
      
      if (type === 'weapon') {
        await mintWeapon(id, BigInt(price * 10**18));
      } else {
        await buySkin(id - 1);
      }
      
      toast.success(`${type === 'weapon' ? 'Weapon' : 'Skin'} purchased successfully!`);
      updateBalance();
    } catch (error) {
      console.error("Purchase error:", error);
      toast.error("Transaction failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing, updateBalance]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat().format(price);
  };

  const canAfford = (price) => {
    return balance >= price;
  };

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-xl z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-7xl h-full max-h-[90vh] bg-slate-900 rounded-3xl shadow-2xl overflow-hidden flex border border-slate-700">
        
        {/* Enhanced Dark Sidebar */}
        <div className="w-80 bg-gradient-to-b from-slate-800 to-slate-900 border-r border-slate-700 flex flex-col">
          {/* Professional Dark Header */}
          <div className="p-6 border-b border-slate-700 bg-slate-800/50">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <ShoppingCartOutlined className="text-white text-lg" />
                </div>
                <h2 className="text-2xl font-bold text-white">Arsenal Store</h2>
              </div>
              <button 
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-700 transition-colors text-slate-400 hover:text-white"
              >
                <CloseOutlined className="text-lg" />
              </button>
            </div>
            
            {/* Balance Display */}
            <div className="bg-gradient-to-r from-emerald-900/50 to-teal-900/50 border border-emerald-700/50 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-emerald-300 mb-1">Available Balance</p>
                  <div className="flex items-center gap-2">
                    <DollarOutlined className="text-emerald-400" />
                    <span className="text-2xl font-bold text-emerald-100">{formatPrice(balance)}</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-emerald-800/50 rounded-full flex items-center justify-center border border-emerald-600/30">
                  <CrownOutlined className="text-emerald-400 text-xl" />
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="p-6 border-b border-slate-700">
            <nav className="space-y-2">
              {[
                { key: 'skins', label: 'Character Skins', desc: 'Customize your appearance', icon: '🎨' },
                { key: 'weapons', label: 'Weapons', desc: 'Enhance your arsenal', icon: '⚔️' }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`w-full p-4 rounded-xl text-left transition-all duration-200 group relative
                    ${activeTab === tab.key 
                      ? 'bg-blue-900/50 border-2 border-blue-600/50 shadow-lg' 
                      : 'hover:bg-slate-700/50 border-2 border-transparent'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{tab.icon}</span>
                    <div>
                      <div className={`font-semibold ${activeTab === tab.key ? 'text-blue-200' : 'text-slate-200'}`}>
                        {tab.label}
                      </div>
                      <div className={`text-sm ${activeTab === tab.key ? 'text-blue-300' : 'text-slate-400'}`}>
                        {tab.desc}
                      </div>
                    </div>
                  </div>
                  {activeTab === tab.key && (
                    <div className="w-1 h-8 bg-blue-500 rounded-full absolute left-0 top-1/2 transform -translate-y-1/2 shadow-lg shadow-blue-500/50"></div>
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Weapon Selection List */}
          {activeTab === 'weapons' && (
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-4">Select Weapon</h3>
                {Stats.map((weapon) => (
                  <button
                    key={weapon.id}
                    onClick={() => setSelectedWeapon(weapon)}
                    className={`w-full p-3 rounded-xl text-left transition-all duration-200 border-2
                      ${selectedWeapon.id === weapon.id 
                        ? 'bg-purple-900/50 border-purple-600/50 shadow-lg' 
                        : 'hover:bg-slate-700/50 border-transparent hover:border-slate-600/50'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-slate-700 border border-slate-600">
                        <img 
                          src={weapon.imgUrl} 
                          alt={weapon.name} 
                          className="w-full h-full object-contain p-1" 
                        />
                        {playerWeapons?.[weapon.id - 1] > 0 && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                            <CheckCircleFilled className="text-white text-xs" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={`font-medium truncate ${selectedWeapon.id === weapon.id ? 'text-purple-200' : 'text-slate-200'}`}>
                          {weapon.name}
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-orange-400 flex items-center gap-1">
                            <FireFilled /> {weapon.DAMAGE}
                          </span>
                          <span className="text-xs text-amber-400 flex items-center gap-1">
                            <ThunderboltFilled /> {weapon.FIRE_RATE}
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 bg-slate-800 overflow-hidden flex flex-col">
          
          {activeTab === 'skins' ? (
            <div className="flex-1 overflow-y-auto">
              {/* Skins Header */}
              <div className="bg-slate-800/80 border-b border-slate-700 p-6 backdrop-blur-sm">
                <h1 className="text-3xl font-bold text-white mb-2">Character Skins</h1>
                <p className="text-slate-300">Express your unique style with premium character customizations</p>
              </div>
              
              {/* Skins Grid */}
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Colors.map((skin) => {
                    const isOwned = playerSkins?.[skin.id - 1];
                    const affordable = canAfford(SKIN_PRICE);
                    
                    return (
                      <div key={skin.id} 
                        className={`group bg-slate-800/50 rounded-2xl shadow-xl border-2 overflow-hidden transition-all duration-300 hover:shadow-2xl backdrop-blur-sm
                          ${isOwned 
                            ? 'border-green-600/50 bg-green-900/20 shadow-green-500/10' 
                            : 'border-slate-600/50 hover:border-slate-500/70'
                          }`}
                      >
                        <div className="relative aspect-square bg-gradient-to-br from-slate-700/50 to-slate-800/50 p-6">
                          <img 
                            src={skin.imgUrl} 
                            alt={skin.name} 
                            className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105 drop-shadow-lg" 
                          />
                          {!isOwned && (
                            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              <LockOutlined className="text-3xl text-white mb-2" />
                              <span className="text-white text-sm font-medium">Preview Locked</span>
                            </div>
                          )}
                          {isOwned && (
                            <div className="absolute top-3 right-3 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/50">
                              <CheckCircleFilled className="text-white" />
                            </div>
                          )}
                        </div>
                        
                        <div className="p-4">
                          <h3 className="text-lg font-semibold text-white mb-3">{skin.name}</h3>
                          
                          {isOwned ? (
                            <div className="flex items-center justify-center gap-2 py-3 px-4 bg-green-900/50 text-green-300 rounded-lg font-medium border border-green-700/50">
                              <CheckCircleFilled />
                              <span>Owned</span>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleBuyItem('skin', skin.id, SKIN_PRICE)}
                              disabled={isProcessing || !affordable}
                              className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2
                                ${affordable && !isProcessing
                                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl shadow-blue-500/25' 
                                  : 'bg-slate-700 text-slate-400 cursor-not-allowed border border-slate-600'
                                }`}
                            >
                              <DollarOutlined />
                              <span>{formatPrice(SKIN_PRICE)} {!affordable ? '(Insufficient Funds)' : ''}</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            // Weapon Details View
            <div className="flex-1 overflow-y-auto">
              {/* Weapon Header */}
              <div className="bg-slate-800/80 border-b border-slate-700 p-6 backdrop-blur-sm">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-xl bg-slate-700 border border-slate-600 p-2">
                    <img 
                      src={selectedWeapon.imgUrl} 
                      alt={selectedWeapon.name} 
                      className="w-full h-full object-contain" 
                    />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-white">{selectedWeapon.name}</h1>
                    <p className="text-slate-300">Professional-grade combat equipment</p>
                  </div>
                </div>
              </div>
              
              {/* Weapon Details */}
              <div className="p-6">
                <div className="bg-slate-800/50 rounded-2xl shadow-xl border border-slate-700 overflow-hidden backdrop-blur-sm">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
                    
                    {/* Weapon Image */}
                    <div className="flex items-center justify-center">
                      <div className="relative w-full max-w-sm aspect-square rounded-2xl bg-gradient-to-br from-slate-700/50 to-slate-800/50 border border-slate-600 p-8">
                        <img 
                          src={selectedWeapon.imgUrl} 
                          alt={selectedWeapon.name} 
                          className="w-full h-full object-contain drop-shadow-2xl" 
                        />
                      </div>
                    </div>
                    
                    {/* Weapon Stats & Purchase */}
                    <div className="flex flex-col justify-center">
                      <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="bg-gradient-to-br from-orange-900/50 to-red-900/50 border border-orange-700/50 rounded-xl p-6 text-center backdrop-blur-sm">
                          <div className="w-12 h-12 bg-orange-800/50 rounded-full flex items-center justify-center mx-auto mb-3 border border-orange-600/30">
                            <FireFilled className="text-orange-400 text-xl" />
                          </div>
                          <div className="text-sm font-medium text-orange-300 mb-1">Damage</div>
                          <div className="text-3xl font-bold text-orange-100">{selectedWeapon.DAMAGE}</div>
                        </div>
                        
                        <div className="bg-gradient-to-br from-yellow-900/50 to-amber-900/50 border border-yellow-700/50 rounded-xl p-6 text-center backdrop-blur-sm">
                          <div className="w-12 h-12 bg-yellow-800/50 rounded-full flex items-center justify-center mx-auto mb-3 border border-yellow-600/30">
                            <ThunderboltFilled className="text-yellow-400 text-xl" />
                          </div>
                          <div className="text-sm font-medium text-yellow-300 mb-1">Fire Rate</div>
                          <div className="text-3xl font-bold text-yellow-100">{selectedWeapon.FIRE_RATE}</div>
                        </div>
                      </div>
                      
                      {/* Purchase Section */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                          <span className="text-slate-300 font-medium">Price:</span>
                          <span className="text-2xl font-bold text-white">${formatPrice(selectedWeapon.price)}</span>
                        </div>
                        
                        {playerWeapons?.[selectedWeapon.id - 1] > 0 ? (
                          <div className="flex items-center justify-center gap-3 py-4 px-6 bg-green-900/50 text-green-300 rounded-xl font-semibold text-lg border border-green-700/50">
                            <CheckCircleFilled className="text-xl" />
                            <span>Ready for Combat</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleBuyItem('weapon', selectedWeapon.id, selectedWeapon.price)}
                            disabled={isProcessing || !canAfford(selectedWeapon.price)}
                            className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-200 flex items-center justify-center gap-3
                              ${canAfford(selectedWeapon.price) && !isProcessing
                                ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl shadow-purple-500/25' 
                                : 'bg-slate-700 text-slate-400 cursor-not-allowed border border-slate-600'
                              }`}
                          >
                            {isProcessing ? (
                              <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                <span>Processing...</span>
                              </>
                            ) : (
                              <>
                                <ShoppingCartOutlined />
                                <span>{canAfford(selectedWeapon.price) ? 'Add to Arsenal' : 'Insufficient Funds'}</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};