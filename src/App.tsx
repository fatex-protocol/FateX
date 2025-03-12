import { Container } from "@radix-ui/themes";
import "./styles.css"; 
import {  Stack } from "@mui/material";
import { AnimatedBackground} from "./uicomponents/shared/animation_components"
import { NavBar } from './uicomponents/shared/nav_bar';
import { StakeByGrowVotes } from './components/stake_by_grow_votes';
import {
  useCurrentAddress,
} from "@roochnetwork/rooch-sdk-kit";

import { useEffect, useState } from "react";
import { GridNavigation, NavigationCard } from './components/grid_navigation';
import { CheckIn } from './components/check_in';
import { Leaderboard } from './components/leaderboard';

function App() {
  const currentAddress = useCurrentAddress();
  const [leaderboardData, setLeaderboardData] = useState<{
    endTime: string;
    timeRemaining: string;
    totalBurned: string;
  }>({
    endTime: '0',
    timeRemaining: '',
    totalBurned: '0'
  });

  const {
    QueryDailyCheckInConfig,
    QueryCheckInRecord,
  } = CheckIn();

  const [checkInData, setCheckInData] = useState<any>(null);
  const [checkInConfig, setCheckInConfig] = useState<any>(null);

  // Fetch check-in data
  useEffect(() => {
    const fetchCheckInData = async () => {
      if (currentAddress) {
        try {
          const record = await QueryCheckInRecord();
          setCheckInData(record);
          
          const config = await QueryDailyCheckInConfig();
          setCheckInConfig(config);
        } catch (error) {
          // console.error("Failed to fetch check-in data:", error);
        }
      }
    };
    
    fetchCheckInData();
  }, [currentAddress]);

  const [poolInfo, setPoolInfo] = useState<any>(null);
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  const {
    QueryStakePoolInfo,
  } = StakeByGrowVotes();

  useEffect(() => {
    const fetchPoolInfo = async () => {
      try {
        const info = await QueryStakePoolInfo();
        // console.log('Stake pool information:', info); // Add log to view data
        setPoolInfo(info);
      } catch (error) {
        // console.error("Failed to fetch stake pool information:", error);
      }
    };
    
    fetchPoolInfo();
  }, [currentAddress]);

  const {
    QueryLeaderboardEndTimeAndTotalBurned,
  } = Leaderboard();

  useEffect(() => {
    const fetchLeaderboardData = async () => {
      try {
        const { endTime, totalBurned } = await QueryLeaderboardEndTimeAndTotalBurned();
        const now = Math.floor(Date.now() / 1000);
        const diff = parseInt(endTime) - now;
        
        let timeRemaining = 'Event has ended';
        if (diff > 0) {
          const days = Math.floor(diff / (24 * 60 * 60));
          const hours = Math.floor((diff % (24 * 60 * 60)) / (60 * 60));
          const minutes = Math.floor((diff % (60 * 60)) / 60);
          timeRemaining = `${days} d ${hours} h ${minutes} m `;
        }

        setLeaderboardData({
          endTime,
          timeRemaining,
          totalBurned
        });
      } catch (error) {
        // console.error("Failed to fetch leaderboard data:", error);
      }
    };
    
    fetchLeaderboardData();
    const timer = setInterval(fetchLeaderboardData, 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!poolInfo?.end_time) return;
    const updateCountdown = () => {
      const now = Math.floor(Date.now() / 1000);
      const endTime = parseInt(poolInfo.end_time);
      const diff = endTime - now;
      if (diff <= 0) {
        setTimeRemaining('Event has ended');
        return;
      }
      const days = Math.floor(diff / (24 * 60 * 60));
      const hours = Math.floor((diff % (24 * 60 * 60)) / (60 * 60));
      const minutes = Math.floor((diff % (60 * 60)) / 60);
      setTimeRemaining(`${days} d ${hours} h ${minutes} m`);
    };
    updateCountdown();
    const timer = setInterval(updateCountdown, 60000); // Update every minute
    return () => clearInterval(timer);
  }, [poolInfo]);

  // Add navigation card data
  const navigationCards: NavigationCard[] = [
    {
      title: "Staking Operations",
      description: poolInfo ?
        `Stake your tokens to earn daily rewards, or claim your $FATE now!`
        : "Stake your tokens to earn daily rewards, or claim your $FATE now!",
      icon: "💰",
      onClick: () => window.location.href = '/stake',
      width: { lg: 6 },
      extraContent: poolInfo ? {
        stats: [
          {
            label: "Total Staked Amount",
            value: `${poolInfo.total_staked_votes || 0} votes`,
            icon: "📊"
          },
          {
            label: "Release Per Second",
            value: `${poolInfo.release_per_second || 0} FATE`,
            icon: "📈"
          }
        ],
        countdown: timeRemaining
      } : undefined
    },
    {
      title: "Daily Check-In",
      description: checkInData
        ? `Check-in to earn $FATE now!`
        : "Check-in to earn $FATE now!",
      icon: "📅",
      onClick: () => window.location.href = '/check-in',
      width: { lg: 3 },
      extraContent: checkInData && checkInConfig ? {
        continueDays: checkInData.continue_days,
        totalDays: checkInData.total_sign_in_days,
        nextReward: checkInConfig.daily_rewards[Math.min(checkInData.continue_days, checkInConfig.daily_rewards.length - 1)],
        isCheckedInToday: new Date(Number(checkInData.last_sign_in_timestamp) * 1000).toDateString() === new Date().toDateString()
      } : undefined
    },
    {
      title: "Documentation",
      description: "Learn more about FateX ecosystem and join our community! Click to explore →",
      icon: "📚",
      onClick: () => window.location.href = '/docs',
      width: { lg: 3 }
    },
    {
      title: "Raffle System",
      description: "Participate in the raffle event to earn $FATE!",
      icon: "🎲",
      onClick: () => window.location.href = '/raffle',
      width: { lg: 4 }
    },
    {
      title: "🔥 League S1",
      description: "Participate in the $FATE burning ranking event to win Airdrop rewards.",
      icon: "🏆",
      onClick: () => window.location.href = '/leaderboard',
      width: { lg: 8 },
      extraContent: {
        countdown: leaderboardData.timeRemaining,
        stats: [
          {
            label: "Event Status",
            value: leaderboardData.timeRemaining === 'Event has ended' ? 'Ended' : '🔥Event in Progress',
            icon: "⏳"
          },
          {
            label: "Total Burned Amount",
            value: `${leaderboardData.totalBurned || 0} $FATE`,
            icon: "🔥"
          }
        ]
      }
    }
  ];

  return (
    <>
      <AnimatedBackground />
      <NavBar />
      <Container
        className="app-container"
        style={{
          maxWidth: '100%',
          padding: '0 24px',
          position: 'relative',
          zIndex: 1,
          backdropFilter: 'blur(10px)',
          backgroundColor: 'rgba(255, 255, 255, 0.3)',
          transition: 'backdrop-filter 0.3s ease',
          overflow: 'visible'
        }}
      >
        <Stack 
          direction="column-reverse"
          spacing={2}
          sx={{
            justifyContent: "normal",
            alignItems: "stretch",
            width: '100%',
            position: 'relative',
            overflow: 'visible',
            padding: '0',
            maxWidth: '1440px',
            margin: '0 auto'
          }}
        >
          <div className="navigation-wrapper" style={{ width: '100%' }}>
            <GridNavigation cards={navigationCards} defaultHeight="auto" fullWidth={false} />
          </div>
        </Stack>
      </Container>
    </>
  );
}

export default App;