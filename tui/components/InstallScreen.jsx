import React, { useState, useEffect } from 'react';
import { Box, Text, useInput, useApp } from 'ink';
import { installModel, isOllamaInstalled } from '../../services/ollamaInstaller.js';

// Phase: 'installing' | 'success' | 'error'
export default function InstallScreen({ modelData, onBack }) {
  const { exit } = useApp();
  const { model } = modelData;
  const tag = model.ollama_tag || model.name;

  const [phase, setPhase] = useState('installing');
  const [statusLines, setStatusLines] = useState(['Connecting to Ollama...']);
  const [errorMessage, setErrorMessage] = useState(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    // Pre-flight check
    if (!isOllamaInstalled()) {
      setPhase('error');
      setErrorMessage('Ollama is not installed. Visit https://ollama.com/download');
      setDone(true);
      return;
    }

    setStatusLines([`Starting install for ${tag}...`]);

    installModel(tag, (line) => {
      setStatusLines(prev => {
        // Keep only the last 4 lines to avoid growing the UI height
        const next = [...prev, line];
        return next.slice(-4);
      });
    })
      .then(() => {
        setPhase('success');
        setDone(true);
      })
      .catch((err) => {
        setPhase('error');
        setErrorMessage(err.message || 'Unknown installation error');
        setDone(true);
      });
  }, []);

  useInput((input, key) => {
    if (!done) {
      // Block all input while installing to prevent duplicate installs or accidental exit
      return;
    }

    if (input === 'q' && phase !== 'installing') {
      exit();
      return;
    }

    if (key.escape || key.return) {
      onBack();
    }
  });

  if (phase === 'installing') {
    return (
      <Box flexDirection="column" width={56}>
        <Box borderStyle="single" borderBottom={false} flexDirection="column" alignItems="center" borderColor="cyan">
          <Text bold color="cyan">INSTALLING MODEL</Text>
        </Box>
        <Box borderStyle="single" borderTop={false} borderBottom={false} borderColor="cyan" flexDirection="column" paddingX={2} paddingY={1}>
          <Box marginBottom={1}>
            <Text bold color="white">{model.display_name}</Text>
          </Box>
          <Box marginBottom={1}>
            <Text color="gray">────────────────────────────────────────────────</Text>
          </Box>
          {statusLines.map((line, i) => (
            <Text key={i} color={i === statusLines.length - 1 ? 'white' : 'gray'}>{line}</Text>
          ))}
        </Box>
        <Box borderStyle="single" borderTop={false} paddingX={1} borderColor="cyan">
          <Text color="gray">Please wait...</Text>
        </Box>
      </Box>
    );
  }

  if (phase === 'success') {
    return (
      <Box flexDirection="column" width={56}>
        <Box borderStyle="single" borderBottom={false} flexDirection="column" alignItems="center" borderColor="green">
          <Text bold color="green">INSTALLATION COMPLETE</Text>
        </Box>
        <Box borderStyle="single" borderTop={false} borderBottom={false} borderColor="green" flexDirection="column" paddingX={2} paddingY={1}>
          <Box marginBottom={1}>
            <Text color="green" bold>✓ {model.display_name} installed successfully</Text>
          </Box>
          <Box marginTop={1} flexDirection="column">
            <Text color="gray">Enter   Return to Model Details</Text>
            <Text color="gray">Esc     Return to Model Details</Text>
          </Box>
        </Box>
        <Box borderStyle="single" borderTop={false} paddingX={1} borderColor="green">
          <Text color="gray">Enter / Esc Back   q Quit</Text>
        </Box>
      </Box>
    );
  }

  // phase === 'error'
  return (
    <Box flexDirection="column" width={56}>
      <Box borderStyle="single" borderBottom={false} flexDirection="column" alignItems="center" borderColor="red">
        <Text bold color="red">INSTALLATION FAILED</Text>
      </Box>
      <Box borderStyle="single" borderTop={false} borderBottom={false} borderColor="red" flexDirection="column" paddingX={2} paddingY={1}>
        <Box marginBottom={1}>
          <Text color="red" bold>✗ Unable to install {model.display_name}</Text>
        </Box>
        <Box marginBottom={1}>
          <Text color="gray">{errorMessage}</Text>
        </Box>
        <Box marginTop={1}>
          <Text color="gray">Enter / Esc  Return to Model Details</Text>
        </Box>
      </Box>
      <Box borderStyle="single" borderTop={false} paddingX={1} borderColor="red">
        <Text color="gray">Enter / Esc Back   q Quit</Text>
      </Box>
    </Box>
  );
}
