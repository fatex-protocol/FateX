import { useCreateSessionKey, useCurrentAddress } from '@roochnetwork/rooch-sdk-kit';
import { MODULE_ADDRESS } from '../config/constants';

export function useSessionKey() {
  const { mutateAsync: createSessionKey } = useCreateSessionKey();
  const addr = useCurrentAddress();

  // 检查本地存储中是否有有效的 session
  const checkSessionKey = async (): Promise<boolean> => {
    if (!addr) return false;

    // Step 1: Get lastConnectedAddress from wallet connect info
    const walletConnectData = localStorage.getItem('rooch-sdk-kit:wallet-connect-infomainnetbitcoin');
    if (!walletConnectData) {
      console.log('walletConnectData does not exist');
      return false;
    }
    let walletConnectObj;
    try {
      walletConnectObj = JSON.parse(walletConnectData);
    } catch (error) {
      console.error('Failed to parse walletConnectData', error);
      return false;
    }
    const lastConnectedAddress = walletConnectObj?.state?.lastConnectedAddress;
    if (!lastConnectedAddress) {
      console.log('lastConnectedAddress not found');
      return false;
    }

    // Step 2: Get sessions array from session info
    const sessionInfoData = localStorage.getItem('rooch-sdk-kit:rooch-session-info');
    if (!sessionInfoData) {
      console.log('sessionInfoData does not exist');
      return false;
    }
    let sessionInfoObj;
    try {
      sessionInfoObj = JSON.parse(sessionInfoData);
    } catch (error) {
      console.error('Failed to parse sessionInfoData', error);
      return false;
    }
    const sessions = sessionInfoObj?.state?.sessions;
    if (!Array.isArray(sessions)) {
      console.log('sessions is not an array');
      return false;
    }

    // Step 3: Find a session matching the lastConnectedAddress
    const matchingSession = sessions.find(session => session.bitcoinAddress === lastConnectedAddress);
    if (!matchingSession) {
      console.log('No session found matching bitcoinAddress');
      return false;
    }

    // Step 4: Check if the matching session has expired
    const lastActiveTime = matchingSession.lastActiveTime; // in milliseconds
    const maxInactiveInterval = matchingSession.maxInactiveInterval; // in seconds
    if (!lastActiveTime || !maxInactiveInterval) {
      console.log('Session data is incomplete (missing lastActiveTime or maxInactiveInterval)');
      return false;
    }
    const sessionExpiryTime = lastActiveTime + (maxInactiveInterval * 1000); // Convert to milliseconds
    const now = Date.now(); // Current time in milliseconds
    if (now < sessionExpiryTime) {
      console.log('Session is still valid');
      return true;
    } else {
      console.log('Session has expired');
      return false;
    }
  };

  // 创建新的 session
  const createSession = async (): Promise<boolean> => {
    if (!addr) return false;
    try {
      await createSessionKey({
        appName: 'Fate X',
        appUrl: 'https://fatex.zone',
        scopes: [`${MODULE_ADDRESS}::*::*`],
        maxInactiveInterval: 86400, // 1 day validity
      });
      return true;
    } catch (e) {
      console.error('Failed to create session', e);
      return false;
    }
  };

  return {
    checkSessionKey,
    createSession,
  };
}