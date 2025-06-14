import { DollarOutlined, LockOutlined, ShoppingOutlined } from "@ant-design/icons";
import { Avatar, Input, Segmented } from "antd";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { CharacterShowcase } from "./CharacterShowcase";
import Stats from "./Stats.json";
import Colors from "./Colors.json";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { getOwnedSkins, getProfile, getWeaponBalances, getXTokenBalance, setProfile } from "../contracts/function";
import { formatEther } from "viem";
import { EditProfile } from "./EditProfile";
import { uploadToIpfs } from "../contracts/pinata";
import { Shop } from "./Shop";

// Add this component after your imports
const CreateProfileModal = ({ onSubmit, onCancel }) => {
  const [name, setName] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        // Set preview for immediate visual feedback
        setPreview(URL.createObjectURL(file));
        
        // Show loading state
        toast.info("Uploading image to IPFS...", {
          position: "top-center",
        });

        // Upload to IPFS
        const ipfsUri = await uploadToIpfs(file);
        
        // Set the IPFS URI as the image
        setImage(ipfsUri);
        
        toast.success("Image uploaded successfully!", {
          position: "top-center",
        });
      } catch (error) {
        console.error("Error uploading image:", error);
        toast.error("Failed to upload image. Please try again.", {
          position: "top-center",
        });
        
        // Clear preview and image if upload fails
        setPreview("");
        setImage(null);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !image) {
      toast.error("Please fill in all fields");
      return;
    }
    onSubmit({ name, image });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-gradient-to-br from-blue-800 to-blue-600 p-8 rounded-2xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-white">
          Create Your Profile
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-white">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-black bg-opacity-30 p-3 rounded-lg text-white"
              placeholder="Enter your name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-white">Profile Picture</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full bg-black bg-opacity-30 p-3 rounded-lg text-white"
            />
            {preview && (
              <img src={preview} alt="Preview" className="mt-2 w-20 h-20 rounded-full object-cover" />
            )}
          </div>
          <div className="flex space-x-4 pt-4">
            <button
              type="submit"
              className="flex-1 bg-green-500 hover:bg-green-600 py-3 rounded-lg font-medium transition-all text-white"
            >
              Create Profile
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-red-500 hover:bg-red-600 py-3 rounded-lg font-medium transition-all text-white"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Add this helper function at the top of your component
const formatBalance = (balance) => {
  const number = parseFloat(balance);
  return number.toFixed(2); // Rounds to 2 decimal places
};

export const PlayerProfileForm = ({ onSubmit }) => {
  const [roomCode, setRoomCode] = useState("");
  const [gun, setGun] = useState("Revolver");
  const [color, setColor] = useState("black");
  const [colorId, setColorId] = useState(1);
  const [isEdit, setIsEdit] = useState(false);
  const [gunId, setGunId] = useState(1);
  const [playerColors, setPlayerColors] = useState([]);
  const [playerGuns, setPlayerGuns] = useState([]);
  const [formData, setFormData] = useState({
    name: "Player 1",
    address: "temp",
    weapon: "AK",
    color: "blue",
    photo:
      "https://cdn.pixabay.com/photo/2023/05/08/09/33/cat-7978052_1280.jpg",
    xp: "195",
    token: "0",
    roomCode: "",
    league: "major",
  });
  const [userBalance, setUserBalance] = useState("0");
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  const formatAddress = (address) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getRank = (xp) => {
    if (xp < 100) return "private";
    if (xp < 200) return "corporal";
    if (xp < 300) return "sergeant";
    return "major";
  };
  useEffect(() => {
    setRoomCode(window.location.hash.substring(4));
    const updatedData = {
      ...formData,
      roomCode: window.location.hash.substring(4),
    };
    setFormData(updatedData);
  }, []);
  const errorClick = () => {
    toast.error("Please purchase locked items before playing.", {
      position: "top-center",
    });
  };
  const handlePlay = () => {
    if (!roomCode.trim()) {
      toast.error("Please enter a Room Code to join or create a game.", {
        position: "top-center",
      });
      return;
    }
    window.location.hash = "r=R" + roomCode.toUpperCase();
    const updatedData = {
      ...formData,
      roomCode: roomCode,
      league: getRank(formData.xp),
      weapon: gun,
      color: color,
    };

    setFormData(updatedData);
    onSubmit(updatedData);
  };

  // Add new state for profile data
  const [profileData, setProfileData] = useState(null);

  // Add these new states at the top of your component
  const [showCreateProfile, setShowCreateProfile] = useState(false);
  const [isProfileLoading, setIsProfileLoading] = useState(true);

  // Add this effect to handle balance updates
  useEffect(() => {
    const updateBalance = async () => {
      if (address && isConnected) {
        try {
          const balance = await getXTokenBalance(address);
          setUserBalance(formatBalance(formatEther(balance)));
        } catch (error) {
          console.error("Error fetching balance:", error);
          setUserBalance("0.00");
        }
      }
    };

    updateBalance();
  }, [address, isConnected]);

  // Update the fetchProfile function in PlayerProfileForm
  useEffect(() => {
    const fetchProfileData = async () => {
      if (address && isConnected) {
        try {
          setIsProfileLoading(true);
          const profile = await getProfile(address);
          
          // Check if profile exists and has a name
          if (!profile.isInitialized || !profile.name) {
            console.log('No profile or name not set');
            setShowCreateProfile(true);
            setIsProfileLoading(false);
            return;
          }

          // Profile exists with name, update states
          setProfileData({
            username: profile.name,
            photo: profile.profileURI,
            xp: Number(profile.xp),
            isInitialized: true,
            weaponBalances: profile.weaponBalances,
            skinsOwned: profile.skinsOwned
          });

          setFormData(prev => ({
            ...prev,
            name: profile.name,
            photo: profile.profileURI,
            xp: profile.xp.toString(),
          }));

          // Update available items
          const availableGuns = profile.weaponBalances.reduce((acc, count, index) => {
            if (Number(count) > 0) {
              acc.push(index + 1);
            }
            return acc;
          }, []);

          const availableColors = profile.skinsOwned.reduce((acc, owned, index) => {
            if (owned === true) {
              acc.push(index + 1);
            }
            return acc;
          }, []);

          setPlayerGuns(availableGuns);
          setPlayerColors(availableColors);
          setShowCreateProfile(false);

        } catch (error) {
          console.error("Error fetching profile:", error);
          toast.error("Failed to load profile");
          setShowCreateProfile(true);
        } finally {
          setIsProfileLoading(false);
        }
      }
    };

    fetchProfileData();
  }, [address, isConnected]);

  // Update handleCreateProfile function
  const handleCreateProfile = async (data) => {
    try {
      toast.info("Creating your profile...");
      
        
      // Then set profile data
      await setProfile(data.image, data.name);
      
      // Fetch the updated profile
      const updatedProfile = await getProfile(address);
      
      if (!updatedProfile.isInitialized) {
        throw new Error("Profile initialization failed");
      }

      // Update states
      setProfileData({
        username: updatedProfile.name,
        photo: updatedProfile.profileURI,
        xp: Number(updatedProfile.xp),
        isInitialized: true,
        weaponBalances: updatedProfile.weaponBalances,
        skinsOwned: updatedProfile.skinsOwned
      });

      // Close modal and show success
      setShowCreateProfile(false);
      toast.success("Profile created successfully!");
      
    } catch (error) {
      console.error("Error creating profile:", error);
      toast.error("Failed to create profile. Please try again.");
    }
  };

  const [weaponsArray, setWeaponsArray] = useState({
    address: '',
    balances: [0, 0, 0, 0, 0]
  });

  const [skinsArray, setSkinsArray] = useState({
    address: '',
    owned: [false, false, false, false, false]
  });

  useEffect(() => {
    const fetchWeaponsAndSkins = async () => {
      if (address && isConnected) {
        try {
          // Fetch weapons and skins in parallel
          const [weapons, skins] = await Promise.all([
            getWeaponBalances(address),
            getOwnedSkins(address)
          ]);

          // Update weapons state with proper format
          setWeaponsArray({
            address: address,
            balances: weapons.map(count => Number(count))
          });
          
          // Update skins state with proper format
          setSkinsArray({
            address: address,
            owned: skins
          });

          // Get available guns (index + 1 for each weapon with count > 0)
          const availableGuns = weapons.reduce((acc, count, index) => {
            if (Number(count) > 0) {
              acc.push(index + 1); // Adding index + 1 for each available weapon
            }
            return acc;
          }, []);
          
          // Get available colors (index + 1 for each owned skin)
          const availableColors = skins.reduce((acc, owned, index) => {
            if (owned === true) {
              acc.push(index + 1); // Adding index + 1 for each owned skin
            }
            return acc;
          }, []);

          console.log('Available Items:', {
            guns: availableGuns,  // Shows array of indices + 1 for available weapons
            colors: availableColors  // Shows array of indices + 1 for owned skins
          });
          
          setPlayerGuns(availableGuns);
          setPlayerColors(availableColors);

        } catch (error) {
          console.error("Error fetching weapons and skins:", error);
          toast.error("Failed to load your items");
        }
      }
    };

    fetchWeaponsAndSkins();
  }, [address, isConnected]);

  // Add state for shop visibility at the top of PlayerProfileForm
  const [isShopOpen, setIsShopOpen] = useState(false);

  return (
    <>
      <div className="h-screen bg-[url('/bg.png')] bg-cover bg-center bg-no-repeat relative">
        <img
          src="./logo.PNG"
          className="absolute left-1/2 bottom-1/2 transform -translate-x-1/2 mb-[5vh]"
          width={"700px"}
        />
        <div className="absolute right-4 top-4 z-10 flex items-center gap-2">
          <div className="border border-yellow-400 rounded-lg p-2">
            <p className="space-x-2 text-lg font-semibold text-yellow-300">
              <DollarOutlined className="text-xl" />
              <span>{userBalance}</span>
            </p>
          </div>
          <button
            onClick={() => setIsShopOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg
              shadow-lg transition-all duration-200 font-semibold flex items-center gap-2"
          >
            <ShoppingOutlined className="text-xl" />
            Shop
          </button>
        </div>
        <div className="absolute left-4 top-4 z-10">
          {!isConnected ? (
            <div className="flex flex-col gap-2">
              <ConnectButton.Custom>
                {({ account, chain, openConnectModal, mounted }) => {
                  return (
                    <div>
                      {(!mounted || !account || !chain) && (
                        <button
                          onClick={openConnectModal}
                          className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700
                            text-white font-semibold transition-all
                            flex items-center justify-center min-w-[160px]"
                        >
                          Connect Wallet
                        </button>
                      )}
                    </div>
                  );
                }}
              </ConnectButton.Custom>
            </div>
          ) : (
            <div className="relative flex flex-col gap-2">
              <div className="flex items-center bg-white/10 backdrop-blur-md rounded-xl p-3 md:p-4 shadow-lg w-[190px] md:w-[300px]">
                <div
                  className="absolute top-2 right-2 text-white cursor-pointer hover:text-gray-300 transition"
                  onClick={() => setIsEdit(!isEdit)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="md:h-5 md:w-5 h-3 w-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5M18.5 2.5a2.121 2.121 0 113 3L12 15l-4 1 1-4 9.5-9.5z"
                    />
                  </svg>
                </div>
                <img
                  src={profileData?.photo || formData.photo}
                  alt="Player"
                  className="h-6 w-6 md:w-12 md:h-12 rounded-full object-cover mr-4"
                  style={{
                    border: `3px solid ${color}`,
                    padding: "2px",
                  }}
                />
                <div className="flex-1 text-white">
                  <div className="flex items-center justify-between w-[120px] md:w-[200px]">
                    <div className="text-md md:text-lg">
                      {profileData?.username || formData.name}
                      
                    </div>
                    <div className="font-semibold text-xs">
                      {formatAddress(address)}
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 md:space-x-2 w-[120px] md:w-[200px]">
                    <img
                      src={`/ranks/${getRank(profileData?.xp || formData.xp)}.png`}
                      alt="League"
                      className="md:w-4 md:h-4 w-3 h-3"
                    />
                    <div className="flex-1 h-2 md:h-3 bg-white/20 rounded-full">
                      <div
                        className="h-full bg-green-500 rounded-full transition-all duration-300"
                        style={{ width: `${(profileData?.xp || Number(formData.xp)) % 100}%` }}
                      />
                    </div>
                    <div className="text-xs font-bold">{profileData?.xp%100}/100</div>
                  </div>
                </div>
              </div>
              <button
                onClick={() => disconnect()}
                className="w-full px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700
                  text-white font-semibold transition-all
                  flex items-center justify-center"
              >
                Disconnect Wallet
              </button>
            </div>
          )}
        </div>

        <div className="absolute left-0 md:left-1/2 bottom-1/4 z-10 flex flex-col md:translate-x-[-25vw] mx-2">
          <Segmented
            vertical
            className="bg-[rgba(0,0,0,0.5)] p-1"
            options={[
              ...Colors.map((color) => ({
                label: (
                  <div className="relative w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16">
                    <Avatar
                      src={color.imgUrl}
                      shape="square"
                      style={{ width: "100%", height: "100%" }}
                    />
                    {!playerColors.includes(color.id) && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-md">
                        <LockOutlined className="text-white text-xl" />
                      </div>
                    )}
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 text-xs text-white px-1 font-bold">
                      {color.name}
                    </div>
                  </div>
                ),
                value: color.type,
              })),
            ]}
            value={color}
            onChange={(value) => setColor(value)}
          />
        </div>

        <CharacterShowcase weapon={gun} key={gun + color} color={color} />

        {isEdit && (
          <>
            <EditProfile
              onBack={() => {
                setIsEdit(false);
              }} address={address}
              profileName={formData.name}
              photo={formData.photo}
            />
          </>
        )}
        <div className="absolute right-0 md:right-1/2 bottom-1/4 z-10 flex flex-col md:translate-x-[25vw] mx-2">
          <Segmented
            vertical
            className="bg-[rgba(0,0,0,0.5)] p-1"
            options={[
              ...Stats.map((gun) => ({
                label: (
                  <div className="relative w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16">
                    <Avatar
                      src={gun.imgUrl}
                      shape="square"
                      style={{ width: "100%", height: "100%" }}
                    />
                    {!playerGuns.includes(gun.id) && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-md">
                        <LockOutlined className="text-white text-xl" />
                      </div>
                    )}
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 text-xs text-white px-1 font-bold">
                      {gun.name}
                    </div>
                  </div>
                ),
                value: gun.type,
              })),
            ]}
            value={gun}
            onChange={(value) => setGun(value)}
          />
        </div>

        <div className="absolute right-4 bottom-4 z-10 flex flex-col ">
          <div className="md:text-sm text-gray-300 text-xs">
            Enter Code to Join/Create
          </div>
          <Input
            addonBefore="R"
            placeholder="ABCDE"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value)}
            className="rounded-lg bg-yellow-400 text-md md:text-lg"
          />
          {playerColors.includes(colorId) && playerGuns.includes(gunId) ? (
            <button
              onClick={handlePlay}
              className="mt-2 bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 text-white font-semibold px-6 py-2 rounded-lg transition-all shadow-md hover:shadow-lg"
            >
              Play Game
            </button>
          ) : (
            <button
              className="mt-2 bg-gradient-to-r from-gray-400 to-gray-500 text-white font-semibold px-6 py-2 rounded-lg transition-all shadow-inner opacity-60 "
              onClick={errorClick}
            >
              Play Game
            </button>
          )}
        </div>
      </div>
      {(showCreateProfile || !profileData?.username) && isConnected && (
        <CreateProfileModal
          onSubmit={handleCreateProfile}
          onCancel={() => {
            disconnect();
            setShowCreateProfile(false);
          }}
        />
      )}
      {isShopOpen && (
        <Shop
          onClose={() => setIsShopOpen(false)}
          balance={userBalance}
          updateBalance={async () => {
            if (address && isConnected) {
              const balance = await getXTokenBalance(address);
              setUserBalance(formatBalance(formatEther(balance)));
            }
          }}
          playerWeapons={weaponsArray.balances}
          playerSkins={skinsArray.owned}
        />
      )}
    </>
  );
};
