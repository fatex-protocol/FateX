
import { Grid } from "@mui/material";
import { keyframes } from "@emotion/react";
import { styled } from "@mui/material/styles";
import { motion } from "framer-motion"; 


// 定义浮动动画
const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;

const Card = styled(motion.div)`
  background: rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(10px);
  padding: 24px;
  height: 100%;
  width: 100%;
  transition: all 0.3s ease;
  cursor: pointer;
  animation: ${float} 6s ease-in-out infinite;
  &:hover {
    transform: translateY(-5px);
    background: rgba(255, 255, 255, 0.25);
    box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.15);
  }
`;

// 创建脉冲效果的徽章
const PulseBadge = styled(motion.div)`
  display: inline-flex;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-weight: 600;
  font-size: 0.875rem;
  line-height: 1.5;
  margin-top: 0.5rem;
  background: linear-gradient(45deg, #4f46e5, #8b5cf6);
  color: white;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
`;

// 创建奖励徽章
const RewardBadge = styled(motion.div)`
  display: inline-flex;
  padding: 0.15rem 0.5rem;
  border-radius: 9999px;
  font-weight: 600;
  font-size: 0.75rem;
  line-height: 1.5;
  margin-left: 0.5rem;
  background: linear-gradient(45deg, #f59e0b, #ef4444);
  color: white;
  box-shadow: 0 2px 4px -1px rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.06);
`;

// 导航卡片类型定义
export interface NavigationCard {
  title: string;
  description: string;
  icon: string;
  onClick?: () => void;
  width?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
  };
  height?: number | string; // 添加高度属性
  extraContent?: {
    continueDays?: number;
    totalDays?: number;
    nextReward?: string;
    isCheckedInToday?: boolean;
    stats?: Array<{
      label: string;
      value: string;
      icon: string;
    }>;
    countdown?: string;
  };
}

interface GridNavigationProps {
  cards: NavigationCard[]; 
  // 添加默认宽度占比属性
  xs?: number;
  sm?: number;
  md?: number;
  lg?: number;
  defaultHeight?: number | string; // 添加默认高度属性
  fullWidth?: boolean;
}

export function GridNavigation({ 
  cards, 
  xs = 12, 
  sm = 6, 
  md = 6, 
  lg = 6,
  defaultHeight = '180px',
}: GridNavigationProps) {
  return (
    <div style={{ width: '100%', position: 'relative', boxSizing: 'border-box', overflow: 'visible' }}>
      <Grid container spacing={3} className="mb-8" sx={{ width: '100%', margin: '0 auto', maxWidth: 'none', overflow: 'visible' }}>
        {cards.map((card, index) => (
          <Grid 
            item 
            xs={card.width?.xs || xs} 
            sm={card.width?.sm || sm} 
            md={card.width?.md || md} 
            lg={card.width?.lg || lg} 
            key={index}
          >
            <Card
              onClick={card.onClick}
              style={{ minHeight: card.height || defaultHeight,margin: '8px',  
              padding: '24px'  }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <div className="relative z-10">
                <div className="text-2xl mb-2">{card.icon}</div>
                <div className="text-xl font-bold mb-2">{card.title}</div>
                <div className="text-gray-600 text-sm">{card.description}</div>
                {/* 签到信息部分 */}
                {card.extraContent && (
                  <div className="mt-4 w-full">
                    {card.extraContent.isCheckedInToday !== undefined && (
                      <motion.div
                         className=" space-y-3"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5 }}
                      >
                        <PulseBadge
                          className={card.extraContent.isCheckedInToday ? "bg-green-500" : "bg-blue-500 cursor-pointer"}
                          animate={{ 
                            boxShadow: ["0px 0px 0px rgba(79, 209, 127, 0.3)", "0px 0px 15px rgba(79, 209, 127, 0.6)", "0px 0px 0px rgba(79, 209, 127, 0.3)"]
                          }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          {card.extraContent.isCheckedInToday ? "✓ Checked in today" : "✓ Check-in"}
                        </PulseBadge>
                      </motion.div>
                    )}
                
                <br />

                {card.extraContent.continueDays && (
                  <div className="mt-2 text-sm font-medium text-gray-700">
                    Total Check-ins: {card.extraContent.continueDays}
                  </div>
                )}
                
                <br />

                {card.extraContent.nextReward && (
                  <div className="mt-2 text-sm font-medium text-gray-700 flex items-center">
                    Next Check-in reward: 
                    <RewardBadge
                      animate={{ 
                        y: [0, -3, 0],
                        rotate: [0, 2, 0, -2, 0]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      {card.extraContent.nextReward} $FATE
                    </RewardBadge>
                  </div>
                )}
              </div>
            )}

            {card.extraContent?.stats && (
                <div className="mt-4 space-y-3">
                  {card.extraContent.stats.map((stat, index) => (
                    <motion.div
                      key={index}
                      className="bg-white/20 rounded-lg p-3"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <div className="flex items-center space-x-2">
                        <span>{stat.icon}</span>
                        <span className="text-sm font-medium text-gray-600">{stat.label}</span>
                      </div>
                      <div className="text-lg font-bold text-indigo-600 mt-1">
                        {stat.value}
                      </div>
                    </motion.div>
                  ))}
                </div>
            )}

            {card.extraContent?.countdown && (
              <div className="mt-4 w-full">
                <motion.div
                  className="bg-red-500/10 rounded-lg p-3"
                  animate={{ 
                    boxShadow: [
                      "0 0 0 rgba(239, 68, 68, 0.2)",
                      "0 0 20px rgba(239, 68, 68, 0.6)",
                      "0 0 0 rgba(239, 68, 68, 0.2)"
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <div className="text-sm font-medium text-gray-600">
                    Time Remaining
                  </div>
                  <div className="text-lg font-bold text-red-600 mt-1">
                    {card.extraContent.countdown}
                  </div>
                </motion.div>
              </div>
            )}
          </div>
        </Card>
      </Grid>
    ))}
  </Grid>
  </div>
  );
}