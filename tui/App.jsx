import React from 'react';
import { Box, Text, useInput, useApp } from 'ink';

export default function App() {
  const { exit } = useApp();

  useInput((input, key) => {
    if (input === 'q') {
      exit();
    }
  });

  return (
    <Box flexDirection="column" width={48}>
      {/* Top Section */}
      <Box borderStyle="single" borderBottom={false} flexDirection="column" alignItems="center">
        <Text bold>⚡ LLM-FIT</Text>
        <Text>Local LLM Compatibility Tool</Text>
      </Box>

      {/* Middle Section */}
      <Box borderStyle="single" flexDirection="column" alignItems="center" paddingY={1}>
        <Text>TUI INITIALIZED</Text>
        <Box marginTop={1}>
          <Text>Ink is working correctly.</Text>
        </Box>
      </Box>

      {/* Bottom Section */}
      <Box borderStyle="single" borderTop={false} paddingX={1}>
        <Text>Press q to quit</Text>
      </Box>
    </Box>
  );
}
