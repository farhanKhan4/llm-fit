import React, { useState, useEffect } from 'react';
import { Box, Text, useInput, useApp } from 'ink';
import { listInstalledModels } from '../../services/ollamaModels.js';

export default function InstalledModels({ onBack }) {
  const { exit } = useApp();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [models, setModels] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [infoMessage, setInfoMessage] = useState(null);

  useEffect(() => {
    try {
      const installed = listInstalledModels();
      setModels(installed);
    } catch (err) {
      setError(err.message || 'Unknown error querying Ollama');
    } finally {
      setLoading(false);
    }
  }, []);

  useInput((input, key) => {
    if (input === 'q') {
      exit();
      return;
    }
    if (key.escape) {
      onBack();
      return;
    }

    if (loading || error || models.length === 0) return;

    if (key.upArrow) {
      setSelectedIndex(prev => Math.max(0, prev - 1));
      setInfoMessage(null);
    }
    if (key.downArrow) {
      setSelectedIndex(prev => Math.min(models.length - 1, prev + 1));
      setInfoMessage(null);
    }
    if (key.return) {
      setInfoMessage('Installed model details will be expanded in a future phase.');
    }
  });

  // ── Sliding window: cap visible rows to avoid terminal scroll ──
  const VISIBLE = 10;
  const half = Math.floor(VISIBLE / 2);
  let startIdx = Math.max(0, selectedIndex - half);
  let endIdx = startIdx + VISIBLE;
  if (endIdx > models.length) {
    endIdx = models.length;
    startIdx = Math.max(0, endIdx - VISIBLE);
  }
  const visibleModels = models.slice(startIdx, endIdx);

  const renderBody = () => {
    if (loading) {
      return <Text color="gray">Loading installed models...</Text>;
    }

    if (error) {
      return (
        <Box flexDirection="column">
          <Text color="red">Ollama is not available.</Text>
          <Box marginTop={1}>
            <Text color="gray">{error}</Text>
          </Box>
        </Box>
      );
    }

    if (models.length === 0) {
      return (
        <Box flexDirection="column">
          <Text color="gray">No models installed.</Text>
          <Box marginTop={1}>
            <Text color="gray">Use  llm-fit recommend  to find compatible models.</Text>
          </Box>
        </Box>
      );
    }

    return (
      <Box flexDirection="column">
        <Box marginBottom={1}>
          <Text bold color="blueBright">Ollama Models</Text>
          <Text color="gray">  ({models.length} total)</Text>
        </Box>
        {models.length > VISIBLE && (
          <Box marginBottom={1}>
            <Text color="gray">Showing {startIdx + 1}–{endIdx} of {models.length}</Text>
          </Box>
        )}
        <Box flexDirection="column">
          {visibleModels.map((m, i) => {
            const realIdx = startIdx + i;
            const isSelected = realIdx === selectedIndex;
            return (
              <Box key={m.name}>
                <Box width={2}>
                  <Text color="green">{isSelected ? '❯' : ' '}</Text>
                </Box>
                <Box width={2}>
                  <Text color="green">✓</Text>
                </Box>
                <Box flexGrow={1}>
                  <Text color={isSelected ? 'white' : 'gray'}>{m.name}</Text>
                </Box>
                {m.size ? (
                  <Box width={8} justifyContent="flex-end">
                    <Text color={isSelected ? 'cyan' : 'gray'}>{m.size}</Text>
                  </Box>
                ) : null}
              </Box>
            );
          })}
        </Box>
        {infoMessage && (
          <Box marginTop={1}>
            <Text color="yellow">{infoMessage}</Text>
          </Box>
        )}
      </Box>
    );
  };

  return (
    <Box flexDirection="column" width={56}>
      <Box
        borderStyle="single"
        borderBottom={false}
        flexDirection="column"
        alignItems="center"
        borderColor="cyan"
      >
        <Text bold color="cyan">INSTALLED MODELS</Text>
      </Box>
      <Box
        borderStyle="single"
        borderTop={false}
        borderBottom={false}
        borderColor="cyan"
        flexDirection="column"
        paddingX={2}
        paddingY={1}
      >
        {renderBody()}
      </Box>
      <Box borderStyle="single" borderTop={false} paddingX={1} borderColor="cyan">
        <Text color="gray">↑↓ Navigate   Enter Select   Esc Back   q Quit</Text>
      </Box>
    </Box>
  );
}
