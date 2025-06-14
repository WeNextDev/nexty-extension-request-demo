import { useEffect, useState } from "react"
import { Storage } from "@plasmohq/storage"

type UserStatus = { isLoggedIn: boolean; email?: string; plan?: string; };
type UserBenefits = { activePlanId: string | null; subscriptionStatus: string | null; };
type PublicData = { latestAnnouncement?: string; };

type ApiState<T> = {
  data: T | null;
  error: string | null;
  isLoading: boolean;
};

const storage = new Storage({ area: "local" });

function IndexPopup() {
  const [publicDataState, setPublicDataState] = useState<ApiState<PublicData>>({ data: null, error: null, isLoading: true });
  const [userStatusState, setUserStatusState] = useState<ApiState<UserStatus>>({ data: null, error: null, isLoading: true });
  const [userBenefitsState, setUserBenefitsState] = useState<ApiState<UserBenefits>>({ data: null, error: null, isLoading: false });

  useEffect(() => {
    const loadAndRefresh = async () => {
      const cachedPublic = await storage.get<PublicData>("public_data_cache");
      if (cachedPublic) {
        setPublicDataState({ data: cachedPublic, error: null, isLoading: false });
      }
      const cachedStatus = await storage.get<UserStatus>("user_status_cache");
      if (cachedStatus) {
        setUserStatusState({ data: cachedStatus, error: null, isLoading: false });
      }

      chrome.runtime.sendMessage({ type: "GET_PUBLIC_DATA" }, (response) => {
        if (chrome.runtime.lastError) {
          if (!cachedPublic) setPublicDataState({ data: null, error: chrome.runtime.lastError.message, isLoading: false });
        } else if (response.success) {
          setPublicDataState({ data: response.data, error: null, isLoading: false });
        } else {
          if (!cachedPublic) setPublicDataState({ data: null, error: response.error, isLoading: false });
        }
      });

      chrome.runtime.sendMessage({ type: "GET_USER_STATUS" }, (response) => {
        if (chrome.runtime.lastError) {
          if (!cachedStatus) setUserStatusState({ data: null, error: chrome.runtime.lastError.message, isLoading: false });
        } else if (response.success) {
          setUserStatusState({ data: response.data, error: null, isLoading: false });
        } else {
          if (!cachedStatus) setUserStatusState({ data: null, error: response.error, isLoading: false });
        }
      });
    };

    loadAndRefresh();
  }, []);

  // 依赖于用户状态，加载订阅权益
  useEffect(() => {
    const loadAndRefreshBenefits = async () => {
      if (!userStatusState.isLoading && userStatusState.data?.isLoggedIn) {
        setUserBenefitsState(prev => ({ ...prev, isLoading: true }));

        const cachedBenefits = await storage.get<UserBenefits>("user_benefits_cache");
        if (cachedBenefits) {
          setUserBenefitsState({ data: cachedBenefits, error: null, isLoading: false });
        }

        chrome.runtime.sendMessage({ type: "GET_USER_BENEFITS" }, (response) => {
          if (chrome.runtime.lastError) {
            if (!cachedBenefits) setUserBenefitsState({ data: null, error: chrome.runtime.lastError.message, isLoading: false });
          } else if (response.success) {
            setUserBenefitsState({ data: response.data, error: null, isLoading: false });
          } else {
            if (!cachedBenefits) setUserBenefitsState({ data: null, error: response.error, isLoading: false });
          }
        });
      }
    };
    loadAndRefreshBenefits();
  }, [userStatusState.isLoading, userStatusState.data?.isLoggedIn]);

  const handleLoginClick = () => {
    chrome.tabs.create({ url: process.env.PLASMO_PUBLIC_SITE_LOGIN_URL });
  };

  return (
    <div style={{ padding: 16, width: 300, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ padding: '8px', background: '#f0f0f0', borderRadius: '4px' }}>
        <h4>Latest Announcement</h4>
        {publicDataState.isLoading && <p>Loading...</p>}
        {publicDataState.error && <p style={{ color: 'red' }}>{publicDataState.error}</p>}
        {publicDataState.data && <p style={{ margin: 0 }}>{publicDataState.data.latestAnnouncement || 'No announcement'}</p>}
      </div>
      <hr style={{ width: '100%', border: 'none', borderTop: '1px solid #ccc' }} />
      
      <h2>User Info</h2>
      {userStatusState.isLoading && <p>Loading...</p>}
      {userStatusState.error && <p style={{ color: 'red' }}>Error: {userStatusState.error}</p>}
      {userStatusState.data && (
        userStatusState.data.isLoggedIn ? (
          <div>
            <p>Welcome, <strong>{userStatusState.data.email}</strong>!</p>
            <p>Your user role: <strong>{userStatusState.data.plan}</strong></p>
            <hr style={{ margin: '12px 0' }} />
            <h4>Subscription Details:</h4>
            {userBenefitsState.isLoading && <p>Loading...</p>}
            {userBenefitsState.error && <p style={{ color: 'red' }}>{userBenefitsState.error}</p>}
            {userBenefitsState.data && (
              <ul>
                <li>Subscription Status: <strong>{userBenefitsState.data.subscriptionStatus || 'None'}</strong></li>
                <li>Current Plan ID: <strong>{userBenefitsState.data.activePlanId || 'None'}</strong></li>
              </ul>
            )}
          </div>
        ) : (
          <div>
            <h4>Please login to use</h4>
            <p>Login to view your subscription information.</p>
            <button onClick={handleLoginClick}>Go to login</button>
          </div>
        )
      )}
    </div>
  );
}

export default IndexPopup
