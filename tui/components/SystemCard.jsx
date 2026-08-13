import React from 'react';
import { Box, Text } from 'ink';

export default function SystemCard() {
  return (
    <Box flexDirection="column" marginTop={1}>
      <Box borderStyle="single" flexDirection="column" paddingX={1} borderColor="gray">
        <Box marginBottom={1}>
          <Text bold color="blueBright">SYSTEM</Text>
        </Box>
        <Box>
          <Box width={10}><Text bold>CPU</Text></Box>
          <Text color="gray">Detecting...</Text>
        </Box>
        <Box>
          <Box width={10}><Text bold>RAM</Text></Box>
          <Text color="gray">Detecting...</Text>
        </Box>
        <Box>
          <Box width={10}><Text bold>GPU</Text></Box>
          <Text color="gray">Detecting...</Text>
        </Box>
        <Box>
          <Box width={10}><Text bold>VRAM</Text></Box>
          <Text color="gray">Detecting...</Text>
        </Box>
      </Box>
    </Box>
  );
}
