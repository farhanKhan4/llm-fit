import React, { useState, useEffect } from 'react';
import { Box, Text, useInput, useApp } from 'ink';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { rankModelsForSystem } from '../../services/recommender.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const MODELS_PATH = path.join(__dirname, '..', '..', 'data', 'models.json');

export default function RecommendedModels({ systemData, onBack }) {
  const { exit } = useApp();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [flatList, setFlatList] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [actionMessage, setActionMessage] = useState(null);

  useEffect(() => {
    async function fetchRecommendations() {
      try {
        const raw = await fs.readFile(MODELS_PATH, 'utf8');
        const models = JSON.parse(raw.replace(/^\uFEFF/, ''));
        
        const buckets = rankModelsForSystem(systemData, models, 'all');
        
        const list = [];
        buckets.recommended.forEach(item => list.push({ ...item, group: 'recommended' }));
        buckets.mightWork.forEach(item => list.push({ ...item, group: 'mightWork' }));
        buckets.notRecommended.forEach(item => list.push({ ...item, group: 'notRecommended' }));
        
        setFlatList(list);
        setLoading(false);
      } catch (err) {
        setError(err.message || 'Unknown error loading recommendations');
        setLoading(false);
      }
    }
    fetchRecommendations();
  }, [systemData]);

  useInput((input, key) => {
    if (input === 'q') {
      exit();
      return;
    }
    if (key.escape) {
      onBack();
      return;
    }

    if (error || loading) {
       return;
    }

    if (key.upArrow) {
      setSelectedIndex(prev => Math.max(0, prev - 1));
      setActionMessage(null);
    }

    if (key.downArrow) {
      setSelectedIndex(prev => Math.min(flatList.length - 1, prev + 1));
      setActionMessage(null);
    }

    if (key.return && flatList.length > 0) {
      setActionMessage('Model details will be available in Phase 5.');
    }
  });

  if (error) {
    return (
      <Box flexDirection="column" width={56}>
        <Box borderStyle="single" borderBottom={false} flexDirection="column" alignItems="center" borderColor="cyan">
          <Text bold color="cyan">RECOMMENDED MODELS</Text>
        </Box>
        <Box borderStyle="single" borderTop={false} borderBottom={false} borderColor="cyan" flexDirection="column" paddingX={2} paddingY={1}>
          <Text color="red">Unable to generate recommendations.</Text>
          <Box marginTop={1}>
            <Text color="gray">{error}</Text>
          </Box>
          <Box marginTop={1}>
            <Text color="gray">Press Esc to return.</Text>
          </Box>
        </Box>
        <Box borderStyle="single" borderTop={false} paddingX={1} borderColor="cyan">
          <Text color="gray">Esc Back    q Quit</Text>
        </Box>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box flexDirection="column" width={56}>
        <Box borderStyle="single" borderBottom={false} flexDirection="column" alignItems="center" borderColor="cyan">
          <Text bold color="cyan">RECOMMENDED MODELS</Text>
        </Box>
        <Box borderStyle="single" borderTop={false} borderBottom={false} borderColor="cyan" flexDirection="column" paddingX={2} paddingY={1}>
          <Text color="gray">Analyzing your hardware...</Text>
          <Box marginTop={1}>
            <Text color="blueBright">Loading...</Text>
          </Box>
        </Box>
        <Box borderStyle="single" borderTop={false} paddingX={1} borderColor="cyan">
          <Text color="gray">Esc Back    q Quit</Text>
        </Box>
      </Box>
    );
  }

  // Calculate the visible sliding window to prevent exceeding terminal height
  const VISIBLE_ITEMS = 8;
  const half = Math.floor(VISIBLE_ITEMS / 2);
  let startIndex = Math.max(0, selectedIndex - half);
  let endIndex = startIndex + VISIBLE_ITEMS;

  if (endIndex > flatList.length) {
    endIndex = flatList.length;
    startIndex = Math.max(0, endIndex - VISIBLE_ITEMS);
  }

  const visibleItems = flatList.slice(startIndex, endIndex);
  const visibleRecommended = visibleItems.filter(i => i.group === 'recommended');
  const visibleMightWork = visibleItems.filter(i => i.group === 'mightWork');
  const visibleNotRecommended = visibleItems.filter(i => i.group === 'notRecommended');

  const renderGroup = (title, items, groupIcon, titleColor) => {
    if (items.length === 0) return null;
    return (
      <Box flexDirection="column" marginBottom={1}>
        <Text color={titleColor} bold>{groupIcon} {title}</Text>
        <Text color="gray">────────────────────────────────────────────────</Text>
        <Box flexDirection="column">
          {items.map((item) => {
            const index = flatList.findIndex(f => f.model.name === item.model.name);
            const isSelected = index === selectedIndex;
            return (
              <Box key={item.model.name}>
                <Box width={2}>
                  <Text color="green">{isSelected ? '❯' : ' '}</Text>
                </Box>
                <Box flexGrow={1}>
                  <Text color={isSelected ? 'white' : 'gray'}>{item.model.display_name}</Text>
                </Box>
                <Box>
                  <Text color={isSelected ? 'cyan' : 'gray'}>{item.model.size_billion_params}B</Text>
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>
    );
  };

  return (
    <Box flexDirection="column" width={56}>
      <Box borderStyle="single" borderBottom={false} flexDirection="column" alignItems="center" borderColor="cyan">
        <Text bold color="cyan">RECOMMENDED MODELS</Text>
      </Box>
      <Box borderStyle="single" borderTop={false} borderBottom={false} borderColor="cyan" flexDirection="column" paddingX={2} paddingY={1}>
        <Box marginBottom={1}>
          <Text color="gray">Based on your system (Showing {startIndex + 1}-{endIndex} of {flatList.length})</Text>
        </Box>
        
        {renderGroup('EXCELLENT', visibleRecommended, '✓', 'green')}
        {renderGroup('GOOD', visibleMightWork, '✓', 'yellow')}
        {renderGroup('LIMITED', visibleNotRecommended, '⚠', 'red')}
        
        {actionMessage && (
          <Box marginTop={1}>
            <Text color="yellow">{actionMessage}</Text>
          </Box>
        )}
      </Box>
      <Box borderStyle="single" borderTop={false} paddingX={1} borderColor="cyan">
        <Text color="gray">↑↓ Navigate   Enter Details   Esc Back   q Quit</Text>
      </Box>
    </Box>
  );
}
