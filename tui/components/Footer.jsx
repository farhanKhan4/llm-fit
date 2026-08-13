import React from 'react';
import { Box, Text } from 'ink';

export default function Footer() {
  return (
    <Box borderStyle="single" borderTop={false} paddingX={1} borderColor="cyan">
      <Text color="gray">↑↓ Navigate    Enter Select    q Quit    Esc Quit</Text>
    </Box>
  );
}
