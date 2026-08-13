import React, { useState } from 'react';
import { Box, Text, useInput, useApp } from 'ink';
import InstallScreen from './InstallScreen.jsx';

export default function ModelDetails({ modelData, systemData, onBack }) {
  const { exit } = useApp();
  const [showInstall, setShowInstall] = useState(false);

  useInput((input, key) => {
    if (input === 'q') {
      exit();
      return;
    }
    if (key.escape) {
      onBack();
      return;
    }
    if (key.return) {
      setShowInstall(true);
    }
  }, { isActive: !showInstall });

  if (showInstall) {
    return (
      <InstallScreen
        modelData={modelData}
        onBack={() => setShowInstall(false)}
      />
    );
  }

  const { model, score, reasons, group } = modelData;

  const getCompatibilityLabel = () => {
    if (group === 'recommended') return { label: '✓ Excellent', color: 'green' };
    if (group === 'mightWork') return { label: '✓ Good', color: 'yellow' };
    return { label: '⚠ Limited', color: 'red' };
  };

  const comp = getCompatibilityLabel();

  const renderRow = (label, value) => (
    <Box>
      <Box width={16}>
        <Text bold>{label}</Text>
      </Box>
      <Box flexGrow={1}>
        <Text color="white">{value}</Text>
      </Box>
    </Box>
  );

  return (
    <Box flexDirection="column" width={56}>
      <Box borderStyle="single" borderBottom={false} flexDirection="column" alignItems="center" borderColor="cyan">
        <Text bold color="cyan">MODEL DETAILS</Text>
      </Box>
      <Box borderStyle="single" borderTop={false} borderBottom={false} borderColor="cyan" flexDirection="column" paddingX={2} paddingY={1}>
        <Box marginBottom={1}>
          <Text bold color="white">{model.display_name}</Text>
        </Box>
        <Text color="gray">────────────────────────────────────────────────</Text>

        <Box flexDirection="column" marginY={1}>
          {renderRow('Parameters', `${model.size_billion_params}B`)}
          {renderRow('Category', model.category)}
          {renderRow('License', model.license || 'N/A')}
          {renderRow('Runtimes', model.supported_runtimes ? model.supported_runtimes.join(', ') : 'N/A')}
          {model.use_cases && renderRow('Use Cases', model.use_cases.join(', '))}
        </Box>

        <Box marginBottom={1}>
          <Text bold color="blueBright">COMPATIBILITY</Text>
        </Box>
        <Box flexDirection="column" marginBottom={1}>
          <Text color={comp.color} bold>{comp.label}</Text>
          <Box marginTop={1} flexDirection="column">
            {renderRow('Score', score)}
            {renderRow('Reason', reasons && reasons.length > 0 ? reasons[0] : 'N/A')}
          </Box>
        </Box>

        <Box marginBottom={1}>
          <Text bold color="blueBright">MEMORY & SYSTEM</Text>
        </Box>
        <Box flexDirection="column" marginBottom={1}>
          {renderRow('Min RAM', `${model.min_ram} GB`)}
          {renderRow('Rec. RAM', `${model.recommended_ram} GB`)}
          {renderRow('Available RAM', `${systemData.ram} GB`)}
          {renderRow('GPU Required', model.gpu_required ? 'Yes' : 'No')}
          {renderRow('Available VRAM', systemData.gpu?.vram ? `${systemData.gpu.vram} GB` : 'N/A')}
        </Box>

        <Box marginTop={1}>
          <Box width={2}>
            <Text color="green">❯</Text>
          </Box>
          <Text color="white">[ Install ]</Text>
        </Box>

      </Box>
      <Box borderStyle="single" borderTop={false} paddingX={1} borderColor="cyan">
        <Text color="gray">Enter Install   Esc Back   q Quit</Text>
      </Box>
    </Box>
  );
}
