import { readContract, writeContract } from "@wagmi/core";
import { config } from "../components/providers";
import { tokenAbi, tokenAddress, platformAbi, platformAddress } from "./contracts"

// XToken Read Functions
export const getXTokenBalance = async (address) => {
  return await readContract(config, {
    abi: tokenAbi,
    address: tokenAddress,
    functionName: "balanceOf",
    args: [address],
  });
};

export const getXTokenTotalSupply = async () => {
  return await readContract(config, {
    abi: tokenAbi,
    address: tokenAddress,
    functionName: "totalSupply",
  });
};

export const checkAllowance = async (owner, spender) => {
  return await readContract(config, {
    abi: tokenAbi,
    address: tokenAddress,
    functionName: "checkAllowance",
    args: [owner, spender],
  });
};

// XToken Write Functions
export const mintXToken = async (to, amount) => {
  return await writeContract(config, {
    abi: tokenAbi,
    address: tokenAddress,
    functionName: "mint",
    args: [to, amount],
  });
};

export const approveXToken = async (spender, amount) => {
  return await writeContract(config, {
    abi: tokenAbi,
    address: tokenAddress,
    functionName: "approve",
    args: [spender, amount],
  });
};

// WeaponProfileSystem Read Functions
export const getProfile = async (address) => {
  const profile = await readContract(config, {
    abi: platformAbi,
    address: platformAddress,
    functionName: "getProfile",
    args: [address],
  });
  
  return {
    profileURI: profile.profileURI,
    xp: profile.xp,
    name: profile.name,
    weaponBalances: profile.weaponBalances,
    skinsOwned: profile.skinsOwned,
  };
};

export const getWeaponBalances = async (address) => {
  return await readContract(config, {
    abi: platformAbi,
    address: platformAddress,
    functionName: "getWeaponBalances",
    args: [address],
  });
};

export const getOwnedSkins = async (address) => {
  return await readContract(config, {
    abi: platformAbi,
    address: platformAddress,
    functionName: "getOwnedSkins",
    args: [address],
  });
};

export const getXTokenBalanceInPlatform = async (address) => {
  return await readContract(config, {
    abi: platformAbi,
    address: platformAddress,
    functionName: "getXTokenBalance",
    args: [address],
  });
};

// WeaponProfileSystem Write Functions
export const setProfile = async (uri, name) => {
  return await writeContract(config, {
    abi: platformAbi,
    address: platformAddress,
    functionName: "setProfile",
    args: [uri, name],
  });
};

export const updateName = async (name) => {
  return await writeContract(config, {
    abi: platformAbi,
    address: platformAddress,
    functionName: "updateName",
    args: [name],
  });
};

export const updateXp = async (newXp) => {
  return await writeContract(config, {
    abi: platformAbi,
    address: platformAddress,
    functionName: "updateXP",
    args: [newXp],
  });
};

export const mintWeapon = async (id, amount) => {
  return await writeContract(config, {
    abi: platformAbi,
    address: platformAddress,
    functionName: "mintWeapon",
    args: [id, amount],
  });
};

export const buySkin = async (skinId) => {
  return await writeContract(config, {
    abi: platformAbi,
    address: platformAddress,
    functionName: "buySkin",
    args: [skinId],
  });
};

export const depositXToken = async (amount) => {
  return await writeContract(config, {
    abi: platformAbi,
    address: platformAddress,
    functionName: "depositXToken",
    args: [amount],
  });
};

export const initializeProfile = async () => {
  return await writeContract(config, {
    abi: platformAbi,
    address: platformAddress,
    functionName: "initializeProfile",
    args: [],
  });
};

// Admin Functions
export const withdrawXToken = async (amount) => {
  return await writeContract(config, {
    abi: platformAbi,
    address: platformAddress,
    functionName: "withdrawXToken",
    args: [amount],
  });
};

export const setSkinPrice = async (newPrice) => {
  return await writeContract(config, {
    abi: platformAbi,
    address: platformAddress,
    functionName: "setSkinPrice",
    args: [newPrice],
  });
};
