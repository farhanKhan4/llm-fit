import React, { useState, useEffect } from 'react';
import { Box, Text, useInput, useApp } from 'ink';
import Header from './components/Header.jsx';
import SystemCard from './components/SystemCard.jsx';
import QuickActions from './components/QuickActions.jsx';
import Footer from './components/Footer.jsx';
import RecommendedModels from './components/RecommendedModels.jsx';
import InstalledModels from './components/InstalledModels.jsx';
import { scanSystemHardware } from '../services/systemScanner.js';

export default function App() {
  const { exit } = useApp();
  const [currentView, setCurrentView] = useState('dashboard');
  
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [actionMessage, setActionMessage] = useState(null);
  
  const [systemData, setSystemData] = useState(null);
  const [scanError, setScanError] = useState(null);

  const actions = [
    'Recommended Models',
    'Browse Models',
    'Installed Models',
    'System Information'
  ];

  useEffect(() => {
    scanSystemHardware()
      .then(data => {
        setSystemData(data);
      })
      .catch(err => {
        setScanError(err.message || 'Unknown scanning error');
      });
  }, []);

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
      if (selectedIndex === 0) {
        setCurrentView('recommended');
      } else if (selectedIndex === 2) {
        setCurrentView('installed');
      } else {
        setActionMessage(`${actions[selectedIndex]} — coming soon`);
      }
    }
  }, { isActive: currentView === 'dashboard' });

  if (currentView === 'recommended') {
    return <RecommendedModels systemData={systemData} onBack={() => setCurrentView('dashboard')} />;
  }

  if (currentView === 'installed') {
    return <InstalledModels onBack={() => setCurrentView('dashboard')} />;
  }

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
        <SystemCard data={systemData} error={scanError} />
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
