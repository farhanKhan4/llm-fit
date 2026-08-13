import React from 'react';
import { Box, Text } from 'ink';

export default function SystemCard({ data, error }) {
  const renderValue = (label, value, isPlaceholder = false) => {
    let color = 'white';
    if (isPlaceholder) {
      color = 'gray';
    } else if (value === 'Not detected' || value === 'N/A' || value === 'Integrated / Unknown') {
      color = 'gray';
    }
    
    return (
      <Box key={label}>
        <Box width={10}><Text bold>{label}</Text></Box>
        <Text color={color}>{value}</Text>
      </Box>
    );
  };

  return (
    <Box flexDirection="column" marginTop={1}>
      <Box borderStyle="single" flexDirection="column" paddingX={1} borderColor="gray">
        <Box marginBottom={1}>
          <Text bold color="blueBright">SYSTEM</Text>
        </Box>

        {error ? (
          <Box paddingY={1}>
            <Text color="red">Scanner Error: {error}</Text>
          </Box>
        ) : !data ? (
          <Box flexDirection="column">
            {renderValue('CPU', 'Scanning...', true)}
            {renderValue('RAM', 'Scanning...', true)}
            {renderValue('GPU', 'Scanning...', true)}
            {renderValue('VRAM', 'Scanning...', true)}
          </Box>
        ) : (
          <Box flexDirection="column">
            {renderValue('CPU', data.cpu?.brand || 'Unknown CPU')}
            {renderValue('RAM', data.ram ? `${data.ram} GB` : 'Unknown')}
            {renderValue('GPU', data.gpu?.model || 'Not detected')}
            {renderValue('VRAM', data.gpu?.vram ? `${data.gpu.vram} GB` : 'N/A')}
          </Box>
        )}
      </Box>
    </Box>
  );
}
