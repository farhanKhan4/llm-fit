import React from 'react';
import { Box, Text } from 'ink';

export default function Header() {
  return (
    <Box borderStyle="single" borderBottom={false} flexDirection="column" alignItems="center" borderColor="cyan">
      <Text bold color="cyan">⚡ LLM-FIT</Text>
      <Text color="gray">Local LLM Compatibility Tool</Text>
    </Box>
  );
}
