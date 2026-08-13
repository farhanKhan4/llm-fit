import React from 'react';
import { Box, Text } from 'ink';

export default function QuickActions({ actions, selectedIndex, actionMessage }) {
  return (
    <Box flexDirection="column" marginTop={1}>
      <Box marginBottom={1}>
        <Text bold color="blueBright">QUICK ACTIONS</Text>
      </Box>
      <Box flexDirection="column">
        {actions.map((action, index) => {
          const isSelected = index === selectedIndex;
          return (
            <Box key={action}>
              <Box width={2}>
                <Text color="green">{isSelected ? '❯' : ' '}</Text>
              </Box>
              <Text color={isSelected ? 'white' : 'gray'}>{action}</Text>
            </Box>
          );
        })}
      </Box>
      {actionMessage && (
        <Box marginTop={1}>
          <Text color="yellow">{actionMessage}</Text>
        </Box>
      )}
    </Box>
  );
}
