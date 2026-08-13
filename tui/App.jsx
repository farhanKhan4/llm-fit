import React, { useState } from 'react';
import { Box, Text, useInput, useApp } from 'ink';
import Header from './components/Header.jsx';
import SystemCard from './components/SystemCard.jsx';
import QuickActions from './components/QuickActions.jsx';
import Footer from './components/Footer.jsx';

export default function App() {
  const { exit } = useApp();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [actionMessage, setActionMessage] = useState(null);

  const actions = [
    'Recommended Models',
    'Browse Models',
    'Installed Models',
    'System Information'
  ];

  useInput((input, key) => {
    if (input === 'q' || key.escape) {
      exit();
      return;
    }

    if (key.upArrow) {
      setSelectedIndex((prev) => Math.max(0, prev - 1));
      setActionMessage(null);
    }

    if (key.downArrow) {
      setSelectedIndex((prev) => Math.min(actions.length - 1, prev + 1));
      setActionMessage(null);
    }

    if (key.return) {
      setActionMessage(`${actions[selectedIndex]} — coming in Phase 4`);
    }
  });

  return (
    <Box flexDirection="column" width={56}>
      <Header />
      <Box 
        borderStyle="single" 
        borderBottom={false} 
        borderTop={false} 
        borderColor="cyan" 
        flexDirection="column" 
        paddingX={2} 
        paddingY={1}
      >
        <Text bold>Dashboard</Text>
        <SystemCard />
        <Box marginTop={1}>
          <QuickActions 
            actions={actions} 
            selectedIndex={selectedIndex} 
            actionMessage={actionMessage} 
          />
        </Box>
      </Box>
      <Footer />
    </Box>
  );
}
